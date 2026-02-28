# Gratitude Text App

A Node.js SMS service that helps families build a daily gratitude practice together.

**What it does:**
- Texts everyone a rotating morning prompt ("What's one thing you're grateful for today?")
- Saves their replies and sends back an encouraging message
- Tracks streaks and celebrates milestones (3 days, 7 days, 30 days…)
- Sends a gentle evening reminder to anyone who hasn't replied yet

---

## Prerequisites

- **Node.js 18+**
- A **Twilio** account with a phone number capable of sending/receiving SMS
  - Sign up at https://console.twilio.com (free trial available)
- A way to expose your server to the internet for Twilio webhooks:
  - **Local dev**: [ngrok](https://ngrok.com) — `ngrok http 3000`
  - **Production**: any cloud VM, Railway, Fly.io, Heroku, etc.

---

## Setup

### 1. Install dependencies

```bash
cd gratitude-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable               | Description                                         |
|------------------------|-----------------------------------------------------|
| `TWILIO_ACCOUNT_SID`   | From your Twilio console dashboard                  |
| `TWILIO_AUTH_TOKEN`    | From your Twilio console dashboard                  |
| `TWILIO_PHONE_NUMBER`  | Your Twilio number in E.164 format (+15551234567)   |
| `MORNING_HOUR`         | Hour to send morning prompts (default: `8` = 8 AM) |
| `EVENING_HOUR`         | Hour to send reminders (default: `19` = 7 PM)      |
| `TIMEZONE`             | IANA timezone (default: `America/New_York`)         |
| `ADMIN_TOKEN`          | Secret token to protect admin API endpoints         |
| `NODE_ENV`             | Set to `production` to enable Twilio sig validation |

Generate a secure admin token:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start the server

```bash
npm start        # production
npm run dev      # development (auto-restarts on file changes)
```

### 4. Configure your Twilio webhook

In your Twilio console, go to **Phone Numbers → Manage → Active Numbers** → click your number.

Under **Messaging → A message comes in**, set:
- **Webhook URL**: `https://your-domain.com/webhook/sms`
- **HTTP Method**: `POST`

For local development using ngrok:
```bash
ngrok http 3000
# Use the https:// URL ngrok gives you: https://abc123.ngrok.io/webhook/sms
```

---

## Adding family members

Use the admin API (replace `YOUR_TOKEN` with your `ADMIN_TOKEN`):

```bash
# Add a member
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_TOKEN" \
  -d '{"name": "Mom", "phone": "555-867-5309"}'

# Add with a specific timezone
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_TOKEN" \
  -d '{"name": "Uncle Bob", "phone": "+13105551234", "timezone": "America/Los_Angeles"}'

# List all members
curl http://localhost:3000/members -H "x-admin-token: YOUR_TOKEN"

# Remove a member (soft delete — won't receive future texts)
curl -X DELETE http://localhost:3000/members/3 -H "x-admin-token: YOUR_TOKEN"
```

Phone numbers are accepted in any common format: `555-867-5309`, `(555) 867-5309`, `+15558675309`.

---

## API Reference

All endpoints except `/health` and `/webhook/sms` require the `x-admin-token` header.

| Method | Path                | Description                                      |
|--------|---------------------|--------------------------------------------------|
| `GET`  | `/health`           | Health check                                     |
| `POST` | `/webhook/sms`      | Twilio incoming SMS webhook (set in Twilio)      |
| `GET`  | `/members`          | List active members                              |
| `POST` | `/members`          | Add a member `{name, phone, timezone?}`          |
| `DELETE`| `/members/:id`     | Deactivate a member                              |
| `GET`  | `/responses`        | Today's entries (add `?date=YYYY-MM-DD` for other dates) |
| `GET`  | `/responses/recent` | Last 30 responses (add `?limit=N` to change)     |
| `GET`  | `/streaks`          | Leaderboard sorted by current streak             |
| `POST` | `/send-morning`     | Manually trigger morning prompts now             |
| `POST` | `/send-reminders`   | Manually trigger evening reminders now           |

---

## How it works

```
8:00 AM  → Server texts everyone today's prompt
           e.g. "Good morning! 🌅 What's one thing you're grateful for today?"

Any time → Family member texts back their gratitude
           Server saves it, replies with encouragement + streak info

7:00 PM  → Server checks who hasn't replied yet
           Sends a gentle reminder to those people (once per day)
```

### Prompts

30 rotating morning prompts are spread across the year — everyone receives the same prompt on the same day, which gives the family something to share and discuss. Prompts automatically cycle through the list year over year.

To add your own prompts, edit the `morningPrompts` array in `prompts.js`.

### Streaks

A streak counts consecutive days with at least one response. Missing a day resets the streak to 1. Milestone messages are sent at: **2, 3, 5, 7, 10, 14, 21, 30, 60, and 100 days**.

---

## Data

Responses are stored in a local SQLite database (`gratitude.db`) that is created automatically on first run. Back this file up to preserve response history.

### Schema

- **members** — family member name, phone, timezone
- **daily_entries** — one row per member per day: the prompt sent, the response received, whether a reminder was sent
- **streaks** — current streak, longest streak, and last response date per member

---

## Deployment tips

- Set `NODE_ENV=production` in your environment to enable Twilio signature validation (protects the webhook from spoofed requests).
- Run with a process manager like **PM2**: `pm2 start server.js --name gratitude-app`
- Back up `gratitude.db` regularly (it's just a file — copy it anywhere).
- The cron jobs use the `TIMEZONE` you set, so the server's system clock doesn't matter.
