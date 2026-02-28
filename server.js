require('dotenv').config();
const express = require('express');
const twilio  = require('twilio');

const db = require('./db');
const { sendSMS, buildTwiML, validateTwilioSignature } = require('./sms');
const { getRandomPositiveResponse, getStreakMessage } = require('./prompts');
const { initScheduler, sendMorningPrompts, sendEveningReminders, getTodayDate } = require('./scheduler');

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

  console.log(`[Webhook] SMS from ${fromPhone}: "${messageBody}"`);

  // Look up the sender
  const member = db.getMemberByPhone(fromPhone);
  if (!member) {
    const twiml = buildTwiML(
      "Hi! I don't recognize this number. Ask a family member to add you to the gratitude group! 🌸"
    );
    return res.type('text/xml').send(twiml);
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

  // Build an encouraging reply
  let reply = getRandomPositiveResponse();

  if (!alreadyResponded) {
    const milestone = getStreakMessage(streakCount);
    if (milestone) {
      reply += `\n\n${milestone}`;
    } else if (streakCount > 1) {
      reply += `\n\n🔥 ${streakCount}-day streak — keep it going!`;
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
app.post('/members', requireAuth, (req, res) => {
  const { name, phone, timezone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }
  try {
    const id = db.addMember({ name, phone, timezone });
    res.status(201).json({ id, name, phone: db.normalizePhone(phone) });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Phone number already registered' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
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
