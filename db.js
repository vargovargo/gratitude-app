const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'gratitude.db'));

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    timezone TEXT DEFAULT 'America/Los_Angeles',
    preferred_time TEXT NOT NULL DEFAULT '08:00',
    onboarding_complete INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS daily_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    date TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT,
    responded_at TEXT,
    reminded INTEGER DEFAULT 0,
    UNIQUE(member_id, date)
  );

  CREATE TABLE IF NOT EXISTS streaks (
    member_id INTEGER PRIMARY KEY REFERENCES members(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_response_date TEXT
  );
`);

// ─── Migrations (safe to run on existing DBs) ─────────────────────────────────

try { db.prepare(`ALTER TABLE members ADD COLUMN preferred_time TEXT NOT NULL DEFAULT '08:00'`).run(); } catch {}
try { db.prepare(`ALTER TABLE members ADD COLUMN onboarding_complete INTEGER DEFAULT 0`).run(); } catch {}

// ─── Phone normalization ──────────────────────────────────────────────────────

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

// ─── Members ──────────────────────────────────────────────────────────────────

function getMemberByPhone(phone) {
  return db.prepare('SELECT * FROM members WHERE phone = ? AND active = 1').get(normalizePhone(phone));
}

function getAllActiveMembers() {
  return db.prepare('SELECT * FROM members WHERE active = 1 ORDER BY name').all();
}

function addMember({ name, phone, timezone = 'America/Los_Angeles' }) {
  const normalized = normalizePhone(phone);
  const result = db.prepare(
    'INSERT INTO members (name, phone, timezone) VALUES (?, ?, ?)'
  ).run(name, normalized, timezone);
  // Initialize streak record
  db.prepare('INSERT OR IGNORE INTO streaks (member_id) VALUES (?)').run(result.lastInsertRowid);
  return result.lastInsertRowid;
}

function deactivateMember(id) {
  return db.prepare('UPDATE members SET active = 0 WHERE id = ?').run(id);
}

function setPreferredTime(memberId, time) {
  db.prepare(
    'UPDATE members SET preferred_time = ?, onboarding_complete = 1 WHERE id = ?'
  ).run(time, memberId);
}

// ─── Daily entries ────────────────────────────────────────────────────────────

function createDailyEntries(date, prompt) {
  const members = getAllActiveMembers();
  const insert = db.prepare(
    'INSERT OR IGNORE INTO daily_entries (member_id, date, prompt) VALUES (?, ?, ?)'
  );
  const insertAll = db.transaction((members) => {
    for (const m of members) insert.run(m.id, date, prompt);
  });
  insertAll(members);
}

// Returns true if a new entry was created, false if it already existed.
function ensureDailyEntry(memberId, date, prompt = 'Spontaneous gratitude') {
  const result = db.prepare(
    'INSERT OR IGNORE INTO daily_entries (member_id, date, prompt) VALUES (?, ?, ?)'
  ).run(memberId, date, prompt);
  return result.changes > 0;
}

function getTodayEntry(memberId, date) {
  return db.prepare(
    'SELECT * FROM daily_entries WHERE member_id = ? AND date = ?'
  ).get(memberId, date);
}

function saveResponse(memberId, response, date) {
  return db.prepare(`
    UPDATE daily_entries
    SET response = ?, responded_at = datetime('now')
    WHERE member_id = ? AND date = ?
  `).run(response, memberId, date);
}

function markReminded(memberId, date) {
  return db.prepare(
    'UPDATE daily_entries SET reminded = 1 WHERE member_id = ? AND date = ?'
  ).run(memberId, date);
}

function getPendingMembers(date) {
  return db.prepare(`
    SELECT m.*, de.reminded
    FROM members m
    JOIN daily_entries de ON m.id = de.member_id
    WHERE de.date = ? AND de.response IS NULL AND m.active = 1
    ORDER BY m.name
  `).all(date);
}

function getEntriesForDate(date) {
  return db.prepare(`
    SELECT m.name, m.phone, de.prompt, de.response, de.responded_at, de.reminded,
           s.current_streak
    FROM members m
    JOIN daily_entries de ON m.id = de.member_id
    LEFT JOIN streaks s ON m.id = s.member_id
    WHERE de.date = ? AND m.active = 1
    ORDER BY m.name
  `).all(date);
}

function getRecentResponses(limit = 30) {
  return db.prepare(`
    SELECT m.name, de.date, de.prompt, de.response, de.responded_at
    FROM daily_entries de
    JOIN members m ON de.member_id = m.id
    WHERE de.response IS NOT NULL
    ORDER BY de.responded_at DESC
    LIMIT ?
  `).all(limit);
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

function getStreak(memberId) {
  return db.prepare('SELECT * FROM streaks WHERE member_id = ?').get(memberId);
}

function updateStreak(memberId, responseDate) {
  const streak = getStreak(memberId);
  if (!streak) return null;

  const lastDate = streak.last_response_date;
  let newStreak = streak.current_streak;

  if (!lastDate) {
    newStreak = 1;
  } else {
    // Compare dates (YYYY-MM-DD strings sort correctly)
    if (lastDate === responseDate) {
      // Already counted today, return as-is
      return streak;
    }
    const last = new Date(lastDate + 'T12:00:00');
    const today = new Date(responseDate + 'T12:00:00');
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
    newStreak = diffDays === 1 ? newStreak + 1 : 1;
  }

  const longestStreak = Math.max(newStreak, streak.longest_streak);
  db.prepare(`
    UPDATE streaks
    SET current_streak = ?, longest_streak = ?, last_response_date = ?
    WHERE member_id = ?
  `).run(newStreak, longestStreak, responseDate, memberId);

  return { ...streak, current_streak: newStreak, longest_streak: longestStreak };
}

function getAllStreaks() {
  return db.prepare(`
    SELECT m.name, m.phone, s.current_streak, s.longest_streak, s.last_response_date
    FROM members m
    JOIN streaks s ON m.id = s.member_id
    WHERE m.active = 1
    ORDER BY s.current_streak DESC, s.longest_streak DESC
  `).all();
}

module.exports = {
  normalizePhone,
  getMemberByPhone,
  getAllActiveMembers,
  addMember,
  deactivateMember,
  setPreferredTime,
  createDailyEntries,
  ensureDailyEntry,
  getTodayEntry,
  saveResponse,
  markReminded,
  getPendingMembers,
  getEntriesForDate,
  getRecentResponses,
  getStreak,
  updateStreak,
  getAllStreaks,
};
