require('dotenv').config();
const express = require('express');
const twilio  = require('twilio');

const db = require('./db');
const { sendSMS, sendWelcomeSMS, buildTwiML, validateTwilioSignature } = require('./sms');
const { getRandomPositiveResponse, getPromptPairedResponse, getShortResponseNudge, getStreakMessage } = require('./prompts');
const { initScheduler, sendMorningPrompts, sendEveningReminders, getTodayDate } = require('./scheduler');

// ─── Time helpers ─────────────────────────────────────────────────────────────

const PRESET_TIMES = { '1': '08:00', '2': '09:00', '3': '07:00' };

/**
 * Parse a user-supplied time string into HH:MM (24h).
 * Handles: "1"/"2"/"3" presets, "8am", "8:30am", "8:30", "08:30", "8", "9 pm", etc.
 * Returns null if unparseable.
 */
function parseTimeInput(input) {
  const s = input.toLowerCase().replace(/\s/g, '');
  if (PRESET_TIMES[s]) return PRESET_TIMES[s];

  const match = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!match) return null;

  let hours   = parseInt(match[1], 10);
  const mins  = parseInt(match[2] || '0', 10);
  const period = match[3];

  if (hours > 23 || mins > 59) return null;

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  if (!period && hours < 6) hours += 12; // bare "8" = 8am, "1" without period = 1pm

  if (hours > 23) return null;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/** Format "HH:MM" (24h) as "8:00 AM" for display. */
function formatTime12h(time) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 || 12;
  return `${display}:${String(m).padStart(2, '0')} ${period}`;
}

const app = express();

// Parse both JSON bodies (admin API) and URL-encoded bodies (Twilio webhooks)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Validate that incoming webhook requests actually came from Twilio.
 * Only enforced in production to keep local development easy.
 */
function validateTwilio(req, res, next) {
  if (process.env.NODE_ENV !== 'production') return next();

  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const signature  = req.headers['x-twilio-signature'] || '';
  // Honor X-Forwarded-Proto when behind a reverse proxy (nginx, Heroku, etc.)
  const proto      = req.headers['x-forwarded-proto'] || req.protocol;
  const host       = req.headers['x-forwarded-host']  || req.get('host');
  const url        = `${proto}://${host}${req.originalUrl}`;

  if (!validateTwilioSignature(authToken, signature, url, req.body)) {
    console.warn('[Webhook] Invalid Twilio signature — request rejected');
    return res.status(403).send('Forbidden');
  }
  next();
}

/**
 * Require a simple bearer token for admin routes.
 * Set ADMIN_TOKEN in .env; leave it unset to disable auth (not recommended).
 */
function requireAuth(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return next(); // Auth disabled — warn in startup message

  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── Twilio SMS Webhook ───────────────────────────────────────────────────────

app.post('/webhook/sms', validateTwilio, async (req, res) => {
  const fromPhone   = req.body.From  || '';
  const messageBody = (req.body.Body || '').trim();
  const date        = getTodayDate();

  // Look up the sender before logging message content
  const member = db.getMemberByPhone(fromPhone);
  if (!member) {
    console.log(`[Webhook] SMS from unrecognized number ${fromPhone} — ignored`);
    return res.type('text/xml').send('<Response></Response>');
  }

  console.log(`[Webhook] SMS from ${fromPhone}: "${messageBody}"`);

  // ── Onboarding: member hasn't set their preferred time yet ──────────────────
  if (!member.onboarding_complete) {
    const parsed = parseTimeInput(messageBody);
    if (parsed) {
      db.setPreferredTime(member.id, parsed);
      const display = formatTime12h(parsed);
      return res.type('text/xml').send(
        buildTwiML(`Perfect! You'll get your daily gratitude prompt at ${display}. Can't wait to hear what you're grateful for! 🌅`)
      );
    } else {
      return res.type('text/xml').send(
        buildTwiML(
          `Hmm, I didn't catch that! Reply:\n1 for 8:00 AM\n2 for 9:00 AM\n3 for 7:00 AM\n\nOr type any time like "10am" or "8:30am".`
        )
      );
    }
  }

  // Ensure a daily entry exists (handles edge case where morning send failed)
  db.ensureDailyEntry(member.id, date);
  const entry = db.getTodayEntry(member.id, date);

  const alreadyResponded = entry?.response != null;

  // Save the response (first one wins; subsequent ones are still saved as updates)
  db.saveResponse(member.id, messageBody, date);

  // Update streak and get the new count
  const updatedStreak = db.updateStreak(member.id, date);
  const streakCount   = updatedStreak?.current_streak ?? 1;

  // Build an encouraging reply, paired to the type of gratitude the prompt invited
  let reply = getPromptPairedResponse(entry.prompt);

  // For very short replies (≤ 3 words), 50% chance to append a gentle nudge
  // inviting more detail. Combine if it fits; otherwise show nudge alone.
  if (!alreadyResponded && messageBody.trim().split(/\s+/).length <= 3 && Math.random() < 0.5) {
    const nudge = getShortResponseNudge();
    const combined = reply + '\n\n' + nudge;
    reply = combined.length <= 320 ? combined : nudge;
  }

  if (!alreadyResponded) {
    const milestone = getStreakMessage(streakCount);
    if (milestone) {
      reply += `\n\n${milestone}`;
    }
  } else {
    reply = "Thanks for the extra gratitude! 🌟 Your positive energy is contagious!";
  }

  res.type('text/xml').send(buildTwiML(reply));
});

// ─── Admin API: Members ───────────────────────────────────────────────────────

// List all active members
app.get('/members', requireAuth, (req, res) => {
  res.json(db.getAllActiveMembers());
});

// Add a new member
app.post('/members', requireAuth, async (req, res) => {
  const { name, phone, timezone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }
  try {
    const id = db.addMember({ name, phone, timezone });
    const normalizedPhone = db.normalizePhone(phone);

    await sendWelcomeSMS(normalizedPhone, name);

    res.status(201).json({ id, name, phone: normalizedPhone });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Phone number already registered' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update a member's timezone and/or preferred_time
app.patch('/members/:id', requireAuth, (req, res) => {
  const { timezone, preferred_time } = req.body;
  if (!timezone && !preferred_time) {
    return res.status(400).json({ error: 'timezone or preferred_time required' });
  }
  db.updateMember(parseInt(req.params.id), { timezone, preferred_time });
  res.json({ success: true });
});

// Deactivate a member (soft delete)
app.delete('/members/:id', requireAuth, (req, res) => {
  db.deactivateMember(req.params.id);
  res.json({ success: true });
});

// ─── Admin API: Responses & Streaks ──────────────────────────────────────────

// Get all entries for a specific date (defaults to today)
app.get('/responses', requireAuth, (req, res) => {
  const date = req.query.date || getTodayDate();
  res.json(db.getEntriesForDate(date));
});

// Get recent responses across all days
app.get('/responses/recent', requireAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  res.json(db.getRecentResponses(limit));
});

// Leaderboard sorted by current streak
app.get('/streaks', requireAuth, (req, res) => {
  res.json(db.getAllStreaks());
});

// ─── Admin API: Manual triggers ───────────────────────────────────────────────

// Send morning prompts right now (useful for testing or catch-up)
app.post('/send-morning', requireAuth, async (req, res) => {
  try {
    await sendMorningPrompts();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send evening reminders right now
app.post('/send-reminders', requireAuth, async (req, res) => {
  try {
    await sendEveningReminders();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: Add member form (token via query param — bookmarkable) ────────────

app.get('/admin/add-member', requireAuth, (req, res) => {
  const token = req.query.token || '';
  const added = req.query.added || '';
  const err   = req.query.err   || '';
  res.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Add Member</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 40px auto; padding: 0 20px; color: #222; }
    h1 { font-size: 1.3rem; margin-bottom: 0.25rem; }
    p  { color: #555; margin-bottom: 1.25rem; line-height: 1.5; font-size: 0.95rem; }
    label { display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem; }
    input, select { width: 100%; box-sizing: border-box; padding: 10px 12px; font-size: 1rem; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 1rem; }
    button { width: 100%; padding: 12px; background: #4a7c59; color: #fff; font-size: 1rem; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; }
    button:active { background: #3a6349; }
    .success { background: #e6f4ea; border: 1px solid #4a7c59; border-radius: 6px; padding: 12px 16px; margin-bottom: 1rem; color: #2d5a3d; font-weight: 600; }
    .error   { background: #fdecea; border: 1px solid #c0392b; border-radius: 6px; padding: 12px 16px; margin-bottom: 1rem; color: #922b21; font-weight: 600; }
  </style>
</head>
<body>
  <h1>🌿 Add a Member</h1>
  <p>They'll get a welcome SMS and be asked to choose their daily prompt time.</p>
  ${added ? `<div class="success">✓ ${added.replace(/[<>&"]/g, '')} added! Welcome SMS sent.</div>` : ''}
  ${err    ? `<div class="error">⚠ ${err.replace(/[<>&"]/g, '')}</div>` : ''}
  <form method="POST" action="/admin/add-member?token=${encodeURIComponent(token)}">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required autocomplete="name" placeholder="First name">
    <label for="phone">Phone number</label>
    <input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="+1 555 000 0000">
    <label for="timezone">Timezone</label>
    <select id="timezone" name="timezone">
      <option value="America/Los_Angeles">Pacific (LA)</option>
      <option value="America/Denver">Mountain (Denver)</option>
      <option value="America/Chicago">Central (Chicago)</option>
      <option value="America/New_York">Eastern (New York)</option>
      <option value="America/Anchorage">Alaska</option>
      <option value="Pacific/Honolulu">Hawaii</option>
      <option value="Europe/London">UK (London)</option>
    </select>
    <button type="submit">Add member →</button>
  </form>
</body>
</html>`);
});

app.post('/admin/add-member', requireAuth, async (req, res) => {
  const token    = req.query.token || '';
  const name     = (req.body.name     || '').trim().slice(0, 100);
  const phone    = (req.body.phone    || '').trim().slice(0, 30);
  const timezone = (req.body.timezone || 'America/Los_Angeles').trim();

  if (!name || !phone) {
    return res.redirect(`/admin/add-member?token=${encodeURIComponent(token)}&err=Name+and+phone+are+required`);
  }

  try {
    const id = db.addMember({ name, phone, timezone });
    const normalizedPhone = db.normalizePhone(phone);

    await sendWelcomeSMS(normalizedPhone, name);

    res.redirect(`/admin/add-member?token=${encodeURIComponent(token)}&added=${encodeURIComponent(name)}`);
  } catch (err) {
    const msg = err.message.includes('UNIQUE') ? 'That phone number is already registered' : err.message;
    res.redirect(`/admin/add-member?token=${encodeURIComponent(token)}&err=${encodeURIComponent(msg)}`);
  }
});

// ─── Public: Signup interest form ─────────────────────────────────────────────

app.get('/signup', (req, res) => {
  res.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Join the Gratitude Group</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 60px auto; padding: 0 24px; color: #222; }
    h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
    p  { color: #555; margin-bottom: 1.5rem; line-height: 1.5; }
    label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
    input { width: 100%; box-sizing: border-box; padding: 10px 12px; font-size: 1rem; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 1rem; }
    button { width: 100%; padding: 12px; background: #4a7c59; color: #fff; font-size: 1rem; border: none; border-radius: 6px; cursor: pointer; }
    button:hover { background: #3a6349; }
    small { display: block; margin-top: 1rem; color: #888; font-size: 0.8rem; line-height: 1.4; }
  </style>
</head>
<body>
  <h1>🌿 Join the Daily Gratitude Group</h1>
  <p>One morning text, one gratitude question. Leave your info and a family member will reach out to get you set up.</p>
  <form method="POST" action="/signup">
    <label for="name">Your name</label>
    <input type="text" id="name" name="name" required autocomplete="name" placeholder="First name is fine">
    <label for="phone">Your cell number</label>
    <input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="+1 555 000 0000">
    <button type="submit">I'm interested →</button>
  </form>
  <small>This is a private family program. Your number won't be added until you give verbal consent. Reply STOP anytime to opt out. Message &amp; data rates may apply.</small>
</body>
</html>`);
});

app.post('/signup', async (req, res) => {
  const name  = (req.body.name  || '').trim().slice(0, 100);
  const phone = (req.body.phone || '').trim().slice(0, 30);

  if (!name || !phone) {
    return res.status(400).type('text/html').send('<p>Name and phone are required. <a href="/signup">Go back</a></p>');
  }

  const adminPhone = process.env.ADMIN_PHONE;
  if (adminPhone) {
    try {
      await sendSMS(adminPhone, `Gratitude group interest: ${name} / ${phone} — reach out for verbal consent, then add via POST /members.`);
    } catch (err) {
      console.error('[Signup] Failed to notify admin:', err.message);
    }
  } else {
    console.log(`[Signup] Interest form submitted — Name: ${name}, Phone: ${phone} (ADMIN_PHONE not set, SMS skipped)`);
  }

  res.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Got it!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 60px auto; padding: 0 24px; color: #222; text-align: center; }
    h1 { font-size: 1.4rem; }
    p  { color: #555; line-height: 1.5; }
  </style>
</head>
<body>
  <h1>🌿 Got it, ${name.replace(/[<>&"]/g, '')}!</h1>
  <p>Someone will reach out soon to get you set up. Talk to you then!</p>
</body>
</html>`);
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', date: getTodayDate(), timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\nGratitude app running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook/sms`);

  if (!process.env.ADMIN_TOKEN) {
    console.warn('\nWARNING: ADMIN_TOKEN is not set — admin routes are unprotected!');
  }

  initScheduler();
  console.log();
});

module.exports = app;
