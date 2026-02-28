# CLAUDE.md — Gratitude Text App

## Project overview

A Node.js SMS service that sends daily gratitude prompts to family members via Twilio, saves their responses, tracks streaks, and sends evening reminders. No frontend — pure backend + SMS.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Database**: SQLite via `better-sqlite3` (synchronous API — no async/await in DB calls)
- **SMS**: Twilio (REST API + webhook)
- **Scheduling**: `node-cron`

## Key files

| File | Purpose |
|---|---|
| `server.js` | Express app, routes, middleware |
| `db.js` | All SQLite queries and schema setup |
| `sms.js` | Twilio send/receive helpers |
| `scheduler.js` | Cron jobs, morning/evening send logic |
| `prompts.js` | Rotating prompt list, positive replies, streak messages |
| `gratitude.db` | SQLite database (auto-created, not committed) |

## Dev commands

```bash
npm run dev   # nodemon — auto-restarts on file changes
npm start     # production
```

## Environment

Copy `.env.example` to `.env`. Required vars:
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `ADMIN_TOKEN` — protects all admin API routes via `x-admin-token` header
- `NODE_ENV=production` — enables Twilio signature validation on the webhook

## Architecture notes

- **DB calls are synchronous** (`better-sqlite3`) — don't add async/await to database functions.
- **Webhook auth**: Twilio signature validation only runs in `NODE_ENV=production`. Skip it in local dev.
- **Admin auth**: All routes except `/health` and `/webhook/sms` require `x-admin-token` header.
- **Soft deletes**: Members are deactivated, not deleted — `active = 0` in the `members` table.
- **One entry per member per day**: `daily_entries` has a unique constraint on `(member_id, date)`.
- **Prompts rotate by day-of-year**: Everyone gets the same prompt on the same day; index = `dayOfYear % prompts.length`.

## Database schema

- `members` — id, name, phone (E.164), timezone, active
- `daily_entries` — member_id, date (YYYY-MM-DD), prompt, response, reminder_sent
- `streaks` — member_id, current_streak, longest_streak, last_response_date

## Testing manually

```bash
# Trigger morning send without waiting for cron
curl -X POST http://localhost:3000/send-morning -H "x-admin-token: YOUR_TOKEN"

# Trigger evening reminders
curl -X POST http://localhost:3000/send-reminders -H "x-admin-token: YOUR_TOKEN"

# Check today's responses
curl http://localhost:3000/responses -H "x-admin-token: YOUR_TOKEN"
```

Use ngrok (`ngrok http 3000`) to expose the local server for Twilio webhook testing.
