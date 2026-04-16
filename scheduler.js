const cron = require('node-cron');
const db = require('./db');
const { sendSMS } = require('./sms');
const { getDailyPrompt, getRandomReminder } = require('./prompts');

const REMINDER_PAUSE_DAYS = parseInt(process.env.REMINDER_PAUSE_DAYS || '7',  10);
const MESSAGE_PAUSE_DAYS  = parseInt(process.env.MESSAGE_PAUSE_DAYS  || '10', 10);

function daysSinceActive(member) {
  const streak = db.getStreak(member.id);
  const ref = streak?.last_response_date ?? member.created_at.slice(0, 10);
  return Math.floor((Date.now() - new Date(ref)) / 86400000);
}

/**
 * Returns today's date string (YYYY-MM-DD) in the configured timezone.
 */
function getTodayDate() {
  const tz = process.env.TIMEZONE || 'America/Los_Angeles';
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
}

/**
 * Send the morning prompt to a single member if they haven't received it today.
 * Uses ensureDailyEntry's return value to prevent duplicate SMS sends.
 */
async function sendMorningPromptToMember(member, date, prompt) {
  const isNew = db.ensureDailyEntry(member.id, date, prompt);
  if (!isNew) return; // already sent today
  await sendSMS(member.phone, prompt);
  console.log(`[Scheduler] Prompt sent to ${member.name}`);
}

/**
 * Minutely check: send each member their prompt when the clock matches their preferred_time.
 * Per-member timezone is respected.
 */
async function checkAndSendPrompts() {
  const members = db.getAllActiveMembers();
  if (members.length === 0) return;

  const now = new Date();
  const date = getTodayDate();
  const prompt = getDailyPrompt(date);

  for (const member of members) {
    if (!member.onboarding_complete) continue;
    if (daysSinceActive(member) > MESSAGE_PAUSE_DAYS) continue;

    // Get current HH:MM in this member's timezone
    const memberTime = now.toLocaleTimeString('en-US', {
      timeZone: member.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }); // e.g. "08:00"

    if (memberTime === member.preferred_time) {
      try {
        await sendMorningPromptToMember(member, date, prompt);
      } catch (err) {
        console.error(`[Scheduler] Failed to send to ${member.name}:`, err.message);
      }
    }
  }
}

/**
 * Send the morning gratitude prompt to all active onboarded members immediately.
 * Used by the /send-morning admin endpoint for manual triggers.
 */
async function sendMorningPrompts() {
  const date = getTodayDate();
  const prompt = getDailyPrompt(date);

  console.log(`[Scheduler] Morning prompts — date: ${date}`);
  console.log(`[Scheduler] Prompt: "${prompt}"`);

  const members = db.getAllActiveMembers()
    .filter((m) => m.onboarding_complete)
    .filter((m) => daysSinceActive(m) <= MESSAGE_PAUSE_DAYS);
  if (members.length === 0) {
    console.log('[Scheduler] No active members to message.');
    return;
  }

  const results = await Promise.allSettled(
    members.map((m) => sendMorningPromptToMember(m, date, prompt))
  );

  const successes = results.filter((r) => r.status === 'fulfilled').length;
  const failures  = results.filter((r) => r.status === 'rejected');

  console.log(`[Scheduler] Morning prompts sent: ${successes}/${members.length}`);
  failures.forEach((f) => console.error('[Scheduler] Send failed:', f.reason?.message));
}

/**
 * Send evening reminders to members who haven't responded yet today.
 * Only sends to each member once (tracks via the `reminded` column).
 */
async function sendEveningReminders() {
  const date = getTodayDate();
  const pending = db.getPendingMembers(date);
  const unreminded = pending.filter(
    (m) => !m.reminded && daysSinceActive(m) <= REMINDER_PAUSE_DAYS
  );

  console.log(`[Scheduler] Evening reminders — ${unreminded.length} pending members`);

  if (unreminded.length === 0) return;

  const results = await Promise.allSettled(
    unreminded.map(async (member) => {
      const reminder = getRandomReminder();
      await sendSMS(member.phone, reminder);
      db.markReminded(member.id, date);
    })
  );

  const successes = results.filter((r) => r.status === 'fulfilled').length;
  const failures  = results.filter((r) => r.status === 'rejected');

  console.log(`[Scheduler] Reminders sent: ${successes}/${unreminded.length}`);
  failures.forEach((f) => console.error('[Scheduler] Reminder failed:', f.reason?.message));
}

/**
 * Register all cron jobs. Call once at server startup.
 */
function initScheduler() {
  const eveningHour = process.env.EVENING_HOUR || '19';
  const timezone    = process.env.TIMEZONE     || 'America/Los_Angeles';

  // Per-member morning prompts: check every minute, send when clock matches preferred_time
  cron.schedule('* * * * *', checkAndSendPrompts);
  console.log('[Scheduler] Per-member morning prompts active (checks every minute)');

  // Evening reminder
  cron.schedule(`0 ${eveningHour} * * *`, sendEveningReminders, { timezone });
  console.log(`[Scheduler] Evening reminders scheduled at ${eveningHour}:00 (${timezone})`);
}

module.exports = { initScheduler, sendMorningPrompts, sendEveningReminders, getTodayDate };
