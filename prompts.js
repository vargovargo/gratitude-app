// ─── Morning prompts ──────────────────────────────────────────────────────────
// All family members receive the same prompt on the same day, so they can
// share and discuss together.

const morningPrompts = [
  "Good morning! 🌅 What's one thing you're grateful for today?",
  "Rise and shine! ✨ Name something that made you smile recently.",
  "Morning! 🌸 What's a small blessing you noticed this week?",
  "Good morning! 🌻 Who is someone you're thankful to have in your life?",
  "Happy morning! 🌈 What's something you're looking forward to today?",
  "Good morning! ☀️ What's a gift in your life you sometimes take for granted?",
  "Morning! 🍃 What's something beautiful you've noticed lately?",
  "Good morning! 💫 What's a recent moment that brought you peace?",
  "Rise and shine! 🌺 What's something your body can do that you're grateful for?",
  "Good morning! 🙏 What's a memory you're grateful to have?",
  "Morning! 🌟 What challenge recently taught you something valuable?",
  "Good morning! 🦋 What simple pleasure are you most thankful for?",
  "Happy morning! 🌊 What's something about your home you're grateful for?",
  "Good morning! 🎵 What skill or ability are you glad you have?",
  "Morning! 🌙 What happened yesterday that you're grateful for?",
  "Good morning! 🍀 Who made a positive difference in your life this week?",
  "Rise and shine! 🌠 What's something about nature you appreciate?",
  "Good morning! 🕊️ What kindness did someone show you lately?",
  "Morning! 💝 What did you accomplish recently that makes you proud?",
  "Good morning! 🌴 What opportunity are you grateful to have right now?",
  "Happy morning! 🍵 What everyday comfort are you especially grateful for?",
  "Good morning! 📚 What did you learn recently that enriched your life?",
  "Morning! 🏡 What do you love most about your daily routine?",
  "Good morning! 🤝 What friendship or relationship are you thankful for today?",
  "Rise and shine! 🎯 What's one thing about today's fresh start you appreciate?",
  "Good morning! 🌻 What difficulty helped you grow into who you are?",
  "Morning! 🦋 What do you see every day but rarely stop to appreciate?",
  "Good morning! 💎 What personal quality in yourself are you grateful for?",
  "Happy morning! 🌈 What made you laugh this week?",
  "Good morning! 🌅 As a new day begins, what are you most thankful for?",
];

// ─── Positive response messages ───────────────────────────────────────────────
// Sent immediately after someone submits their gratitude.

const positiveResponses = [
  "That's beautiful! 🌟 Thank you for sharing that.",
  "Wonderful! 💫 What a lovely thing to be grateful for.",
  "Love that! 🌸 Your gratitude practice is growing stronger every day.",
  "That's so meaningful! ✨ Keep nurturing that grateful heart.",
  "Beautiful! 🙏 Gratitude like that can truly transform your day.",
  "So lovely! 🌺 Thank you for taking a moment to reflect.",
  "That's wonderful! 🌻 Small moments of gratitude add up to a beautiful life.",
  "Awesome! 💝 You're doing amazing with this practice.",
  "That warms my heart! 🌈 Keep shining your grateful light.",
  "Perfect! 🌊 Your mindfulness is an inspiration.",
  "Such a great reflection! 🦋 Gratitude really is a superpower.",
  "Love this! ⭐ Each day of gratitude builds a happier life.",
  "That's precious! 🕊️ Thank you for sharing a piece of your heart.",
  "Wonderful mindset! 🌠 You're growing something beautiful.",
  "So thoughtful! 🎵 Your gratitude makes the world a little brighter.",
  "Fantastic! 🌿 That kind of awareness changes everything.",
  "That's the spirit! 🌻 Gratitude opens the door to more blessings.",
];

// ─── Evening reminder messages ────────────────────────────────────────────────
// Sent to members who haven't responded by the configured evening hour.

const reminderMessages = [
  "Hey! 🌻 Don't forget to share what you're grateful for today. We're cheering you on!",
  "A gentle nudge 🌸 — your daily gratitude is waiting! What's one good thing from today?",
  "Still time! 😊 What's one thing that made today worthwhile?",
  "Hey there! ✨ A quick reminder — what's one bright spot from your day?",
  "Your gratitude moment awaits! 🌟 Take 30 seconds to share something good.",
  "Almost forgot? 🌙 The day's not over — what are you grateful for today?",
  "One small moment of gratitude before the day ends? 🌺 We'd love to hear it!",
];

// ─── Streak milestone messages ────────────────────────────────────────────────
// Appended to the positive response when a milestone is hit.

const streakMilestones = {
  2:   "2 days in a row! 🔥 You're building something great!",
  3:   "3-day streak! 🌟 You're on a roll!",
  5:   "5 days strong! 🎯 Your gratitude habit is taking root!",
  7:   "One full week! 🎉 That's a milestone worth celebrating!",
  10:  "10 days of gratitude! 💪 You're truly committed!",
  14:  "Two weeks straight! 🌺 Your practice is becoming second nature!",
  21:  "21 days! 🧠 Science says habits solidify around now — you've done it!",
  30:  "30 DAYS! 🏆 You've transformed gratitude into a lifestyle. Amazing!",
  60:  "60 days of gratitude! 🌟 You are an absolute inspiration!",
  100: "100 DAYS! 🎊 You're a true gratitude champion. We're so proud of you!",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the same prompt for everyone on a given date, cycling through the list.
 * @param {string} dateStr - YYYY-MM-DD
 */
function getDailyPrompt(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const start = new Date(year, 0, 0);
  const now = new Date(year, month - 1, day);
  const dayOfYear = Math.round((now - start) / (1000 * 60 * 60 * 24));
  return morningPrompts[dayOfYear % morningPrompts.length];
}

function getRandomPositiveResponse() {
  return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
}

function getRandomReminder() {
  return reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
}

/**
 * Returns a streak milestone message if this streak count is a milestone,
 * otherwise returns null.
 */
function getStreakMessage(streakCount) {
  return streakMilestones[streakCount] || null;
}

module.exports = {
  morningPrompts,
  getDailyPrompt,
  getRandomPositiveResponse,
  getRandomReminder,
  getStreakMessage,
};
