const cron = require('node-cron');
const db = require('./db');
const { sendSMS } = require('./sms');
const { getDailyPrompt, getRandomReminder } = require('./prompts');

/**
 * Returns today's date string (YYYY-MM-DD) in the configured timezone.
 */
function getTodayDate() {
  const tz = process.env.TIMEZONE || 'America/New_York';
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
}

/**
 * Send the morning gratitude prompt to all active members.
 * Creates daily_entries for everyone so responses can be tracked.
 */
async function sendMorningPrompts() {
  const date = getTodayDate();
  const prompt = getDailyPrompt(date);

  console.log(`[Scheduler] Morning prompts — date: ${date}`);
  console.log(`[Scheduler] Prompt: "${prompt}"`);

  // Create today's entry rows before sending so responses can be tracked
  db.createDailyEntries(date, prompt);

  const members = db.getAllActiveMembers();
  if (members.length === 0) {
    console.log('[Scheduler] No active members to message.');
    return;
  }

  const results = await Promise.allSettled(
    members.map((m) => sendSMS(m.phone, prompt))
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
  const unreminded = pending.filter((m) => !m.reminded);

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
  const morningHour = process.env.MORNING_HOUR || '8';
  const eveningHour = process.env.EVENING_HOUR || '19';
  const timezone    = process.env.TIMEZONE     || 'America/New_York';

  // Morning prompt
  cron.schedule(`0 ${morningHour} * * *`, sendMorningPrompts, { timezone });
  console.log(`[Scheduler] Morning prompts scheduled at ${morningHour}:00 (${timezone})`);

  // Evening reminder
  cron.schedule(`0 ${eveningHour} * * *`, sendEveningReminders, { timezone });
  console.log(`[Scheduler] Evening reminders scheduled at ${eveningHour}:00 (${timezone})`);
}

module.exports = { initScheduler, sendMorningPrompts, sendEveningReminders, getTodayDate };
