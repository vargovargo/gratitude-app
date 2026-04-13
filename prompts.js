// ─── Morning prompts ──────────────────────────────────────────────────────────
// All family members receive the same prompt on the same day, so they can
// share and discuss together.
//
// Prompts are loaded from prompts.md — edit that file to add or change prompts.
// Each line starting with "- " is treated as a prompt.

const fs = require('fs');
const path = require('path');

const _promptsFile = fs.readFileSync(path.join(__dirname, 'prompts.md'), 'utf8');
const morningPrompts = _promptsFile
  .split('\n')
  .filter(line => line.startsWith('- '))
  .map(line => line.slice(2).trim());

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
  "That sounds incredible! 🌟 Thank you for sharing that moment.",
  "What a powerful reflection! ✨ Thank you for taking time to notice that.",
  "Wow — that's a beautiful thing to carry with you. 🌊 Thanks for sharing.",
  "That kind of awareness is rare. 🌿 Thank you for pausing to reflect on it.",
  "That's the kind of moment worth remembering. ✨ Thanks for bringing it here.",
  "What a vivid memory. 🌌 That feeling you're describing is something special.",
  "That gives me chills just reading it. 💫 Thank you for sharing that.",
  "Something about that just stays with you, doesn't it. 🏔️ Thank you for sharing.",
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

// ─── Prompt theme map ─────────────────────────────────────────────────────────
// Maps each prompt's exact text to a theme so we can send a response that
// reflects the type of gratitude the prompt invites.

const promptThemeMap = {
  // Morning Prompts
  "Good morning! 🌅 What's one thing you're grateful for today?": 'simple_pleasures',
  "Rise and shine! ✨ Name something that made you smile recently.": 'simple_pleasures',
  "Morning! 🌸 What's a small blessing you noticed this week?": 'simple_pleasures',
  "Good morning! 🌻 Who is someone you're thankful to have in your life?": 'relationships',
  "Happy morning! 🌈 What's something you're looking forward to today?": 'hope',
  "Good morning! ☀️ What's a gift in your life you sometimes take for granted?": 'simple_pleasures',
  "Morning! 🍃 What's something beautiful you've noticed lately?": 'nature',
  "Good morning! 💫 What's a recent moment that brought you peace?": 'simple_pleasures',
  "Rise and shine! 🌺 What's something your body can do that you're grateful for?": 'body',
  "Good morning! 🙏 What's a memory you're grateful to have?": 'memory',
  "Morning! 🌟 What challenge recently taught you something valuable?": 'resilience',
  "Good morning! 🦋 What simple pleasure are you most thankful for?": 'simple_pleasures',
  "Happy morning! 🌊 What's something about your home you're grateful for?": 'simple_pleasures',
  "Good morning! 🎵 What skill or ability are you glad you have?": 'accomplishment',
  "Morning! 🌙 What happened yesterday that you're grateful for?": 'simple_pleasures',
  "Good morning! 🍀 Who made a positive difference in your life this week?": 'relationships',
  "Rise and shine! 🌠 What's something about nature you appreciate?": 'nature',
  "Good morning! 🕊️ What kindness did someone show you lately?": 'kindness',
  "Morning! 💝 What did you accomplish recently that makes you proud?": 'accomplishment',
  "Good morning! 🌴 What opportunity are you grateful to have right now?": 'hope',
  "Happy morning! 🍵 What everyday comfort are you especially grateful for?": 'simple_pleasures',
  "Good morning! 📚 What did you learn recently that enriched your life?": 'accomplishment',
  "Morning! 🏡 What do you love most about your daily routine?": 'simple_pleasures',
  "Good morning! 🤝 What friendship or relationship are you thankful for today?": 'relationships',
  "Rise and shine! 🎯 What's one thing about today's fresh start you appreciate?": 'hope',
  "Good morning! 🌻 What difficulty helped you grow into who you are?": 'resilience',
  "Morning! 🦋 What do you see every day but rarely stop to appreciate?": 'simple_pleasures',
  "Good morning! 💎 What personal quality in yourself are you grateful for?": 'accomplishment',
  "Happy morning! 🌈 What made you laugh this week?": 'simple_pleasures',
  "Good morning! 🌅 As a new day begins, what are you most thankful for?": 'simple_pleasures',
  // Deeper Reflection Prompts
  "Close your eyes and notice one thing you appreciate with your other senses — what is it?": 'body',
  "Think of one person you haven't seen in over a year. What are you grateful for about them?": 'relationships',
  "What's the best thing that happened to you yesterday?": 'simple_pleasures',
  "Is there a stranger who once did something kind for you that you still remember? What happened?": 'kindness',
  "What's one part of your body that works hard for you that you rarely thank?": 'body',
  "Think of a difficult period in your life. What did it teach you or give you that you're grateful for now?": 'resilience',
  "What's something you own that genuinely makes your daily life easier or better?": 'simple_pleasures',
  "Think back to your childhood home or neighborhood. What's one thing from that place you feel grateful for?": 'memory',
  "What's a meal, flavor, or food that you truly love? What do you appreciate about it?": 'simple_pleasures',
  "Is there someone who believed in you before you believed in yourself? Who comes to mind?": 'relationships',
  "What's something in nature — a tree, a view, the sky — that you're glad exists?": 'nature',
  "Think of a book, song, film, or piece of art that has meant something to you. What's one thing you're grateful it gave you?": 'creativity',
  "What's a decision you made — big or small — that you're genuinely glad you made?": 'accomplishment',
  "Name one thing about where you live that you appreciate, even if you don't notice it every day.": 'simple_pleasures',
  "What's a quiet moment from the past week that felt good, even if it was brief?": 'simple_pleasures',
  "Is there someone in your life who shows up reliably, no matter what? What do you value about them?": 'relationships',
  "What's one thing about your work or daily routine that you actually enjoy?": 'simple_pleasures',
  "Think of a season or type of weather you love. What do you appreciate about it?": 'nature',
  "What's something you can do now that you couldn't do five years ago?": 'accomplishment',
  "What's one small act of kindness you gave to someone recently? How did it feel?": 'kindness',
  "What's a habit or practice — however small — that's been good for you?": 'accomplishment',
  "Think of someone who has passed away. What's one thing about them you carry with you and are grateful for?": 'memory',
  "What's something you were worried about that turned out okay? What does that tell you?": 'resilience',
  "What's a tool, app, or piece of technology that genuinely helps your life?": 'simple_pleasures',
  "Think about your five senses. Which one are you most grateful for today, and why?": 'body',
  "What's something simple you did for yourself recently that was good for you?": 'simple_pleasures',
  "What's a place — anywhere in the world — that you're glad you've been to or that exists?": 'nature',
  "What's one thing you're looking forward to, even if it's small?": 'hope',
  "Who in your life makes hard things feel easier? What do you appreciate about how they show up?": 'relationships',
  // Awe Reflection Prompts
  "Good morning! 🌌 What's the most vast or enormous thing you've ever stood in front of — ocean, mountain, canyon? What was it like?": 'awe',
  "Morning! 🏔️ Think of the most awe-inspiring place you've ever been. What made it feel so immense?": 'awe',
  "What's something in the sky — a storm, a sunset, a starry night — that has ever stopped you in your tracks?": 'awe',
  "Good morning! 🌊 When did you last feel the sheer scale of nature? What were you looking at?": 'awe',
  "Morning! 🌀 What's something beautiful or strange that genuinely surprised you recently — something that made you stop and think?": 'awe',
  "Good morning! ✨ What's a fact about the universe, nature, or life that still amazes you when you think about it?": 'awe',
  "What's something you used to take for granted that, once you really thought about it, turned out to be astonishing?": 'awe',
  "Morning! 🔭 Has a place, experience, or idea ever changed the way you see the world, even a little? What was it?": 'awe',
  "Good morning! 🌿 When did you last feel small in a way that felt good — like your worries shrank because something larger was around you?": 'awe',
  "Think of a moment when your everyday concerns suddenly seemed smaller. What were you seeing or experiencing?": 'awe',
  "Morning! 🌠 What's something so big or ancient that it made your daily life feel less heavy for a moment?": 'awe',
  "Good morning! 🪐 Have you ever looked at the night sky and felt your sense of self quietly shrink — in a peaceful way? What was that like?": 'awe',
  "Morning! 🕊️ When did you last feel genuinely connected to the world around you — nature, strangers, or something larger? What happened?": 'awe',
  "Good morning! 🌍 What's one thing that reminds you that you're part of something much bigger than your own life?": 'awe',
  "Think of a time you felt unexpected kinship with people you didn't know — at an event, in a crowd, or watching something unfold. What was it?": 'awe',
  "Morning! 🌱 What's something in nature — an animal, a tree, a season — that makes you feel connected to something beyond yourself?": 'awe',
  "Good morning! ⚡ When did you last get goosebumps from something beautiful — a piece of music, a view, a story? What was it?": 'awe',
  "Morning! 🫀 What's the last thing that made time feel like it slowed down — where you were just fully present? What were you doing?": 'awe',
  "Good morning! 😮 What's the last thing that made your jaw drop or gave you chills in a good way?": 'awe',
};

// ─── Themed research-backed responses ─────────────────────────────────────────
// Paired to the gratitude type each prompt invites. Each theme has 2–3 variants
// so responses stay fresh across repeated days in the same category.
// Sources are real and verifiable.

const themedResponses = {
  awe: [
    "That kind of wonder is doing real work. Dacher Keltner's lab at UC Berkeley found that awe — more than any other positive emotion they measured — was linked to lower inflammatory markers in the body. 🌌",
    "Awe is one of the rarest emotions — and one of the most healing. Studies show it shrinks self-focused worry and connects us to something larger than our daily concerns. 🌠",
    "Research by Melanie Rudd (2012, Psychological Science) found that awe literally expands our felt sense of time — people who felt awe reported feeling less rushed and more present. ✨",
  ],
  nature: [
    "Noticing nature's beauty is more powerful than it sounds. Frances Ming Kuo's research found that even brief access to natural settings measurably restores directed attention and reduces stress markers. 🌿",
    "Nature connectedness consistently predicts life satisfaction and wellbeing across dozens of studies worldwide — the felt sense of belonging to the natural world is genuinely good for you. 🌸",
    "Research shows that even viewing natural scenes can restore attentional capacity — and genuinely noticing nature in the real world carries even stronger benefits. 🌲",
  ],
  relationships: [
    "Calling someone specific to mind deepens the effect. Harvard's 85-year study on adult development found relationships are the single greatest predictor of health and happiness across a lifetime. 💛",
    "Sara Algoe's 'find, remind, and bind' theory shows that gratitude toward specific people strengthens those relationships more powerfully than general thankfulness — and the evidence supports it. 🤝",
    "Research consistently shows that gratitude focused on people — rather than things or circumstances — produces the strongest and most lasting wellbeing benefits. 🌻",
  ],
  resilience: [
    "Reflecting on what difficulty gave you is at the heart of post-traumatic growth research. Tedeschi & Calhoun found that finding meaning in hard experiences — not just recovering from them — predicts the deepest long-term psychological gains. 💪",
    "Studies show that reflecting on what hard times taught us — not just surviving them — is linked to lower depression and higher life satisfaction long-term. You just did that. 🌱",
    "Post-traumatic growth research shows that meaning-making from adversity is one of the strongest predictors of resilience and psychological flourishing after difficulty. 🔥",
  ],
  body: [
    "Gratitude for what your body *does* — rather than how it looks — is linked to lower health anxiety and better body image across multiple studies (Tracy Tylka's body appreciation research). 💪",
    "Research links gratitude practice to increased heart rate variability — a marker of parasympathetic activity — and reduced stress hormones. Noticing your body's gifts is part of that. 🌺",
    "Tracy Tylka's research on body appreciation found that gratitude for your body's capabilities — strength, senses, movement — is one of the most stable predictors of positive body image and wellbeing. 🌿",
  ],
  simple_pleasures: [
    "Pausing to notice everyday pleasures is the core of 'savoring,' studied by psychologist Fred Bryant. Research shows savoring small moments amplifies positive emotions far more than big, infrequent highs. ✨",
    "Psychologists call this 'hedonic awareness' — and it's one of the most reliable ways to counteract hedonic adaptation, the tendency to stop enjoying what we already have. 🌻",
    "Studies on positive emotion show that small, frequent pleasures contribute more to lasting wellbeing than rare big ones. You just made that small pleasure count. 🌸",
  ],
  creativity: [
    "Engaging with art, music, or stories activates the brain's default mode network — the same system involved in meaning-making and self-understanding. Reflecting on it extends that benefit. 🎵",
    "A WHO scoping review by Fancourt & Finn (2019) — covering over 3,000 studies — found arts engagement consistently associated with reduced depression, lower cortisol, and stronger positive affect. 🎶",
    "Salimpoor et al. (2011, Nature Neuroscience) found that peak emotional responses to music trigger dopamine release in the brain's reward system — the same pathway activated by food and social connection. 🌟",
  ],
  memory: [
    "Researchers studying nostalgia (led by Constantine Sedikides at Southampton) found that nostalgic reflection consistently increases feelings of meaning, social connectedness, and optimism. 🌿",
    "Reflecting on formative memories strengthens what psychologists call 'narrative identity' — the story of who you are — which is closely tied to resilience and wellbeing. 🕊️",
    "Sedikides & Wildschut's nostalgia research found that revisiting meaningful memories reduces loneliness, bolsters self-continuity, and increases meaning in life — effects replicated across cultures. 🌅",
  ],
  kindness: [
    "Recalling kind acts you've done improves wellbeing. Research by Ko, Margolis, Revord & Lyubomirsky (2021) found that remembering past kindness was just as effective a boost as performing new acts. 💛",
    "Keiko Otake's research found that simply *counting* kind acts for one week raised happiness levels — not just doing them, but noticing them. You just noticed one. 🌸",
    "Sonja Lyubomirsky's positive activity research consistently finds that kindness-based interventions — performing or recalling kind acts — are among the most reliable wellbeing boosters in the field. 🤝",
  ],
  hope: [
    "Looking forward to something — even something small — activates the brain's dopamine reward system, which motivates action and builds positive mood. Anticipation is its own form of joy. 🌈",
    "Rick Snyder's hope theory found that goal-directed thinking — having something meaningful to work toward and believing you can get there — is a strong predictor of resilience and recovery from setbacks. 🌟",
    "Fred Bryant's research on 'anticipatory savoring' shows that mentally dwelling on a future positive event generates real positive emotion now — your brain doesn't wait for it to happen. 🌻",
  ],
  accomplishment: [
    "Albert Bandura's self-efficacy research identified 'mastery experiences' — looking back on capabilities you've built — as the single most powerful source of ongoing confidence. 💪",
    "Martin Seligman's PERMA model identifies accomplishment as one of five pillars of flourishing — and recognizing your own capabilities is central to how this pillar actually supports wellbeing. 🌟",
    "Carol Dweck's research found that noticing how you've grown — recognizing that abilities develop through effort — is the foundation of a growth mindset, which predicts resilience and sustained motivation. 🎯",
  ],
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

/**
 * Returns a response paired to the type of gratitude the prompt invites.
 * ~50% of the time it pulls from the theme-specific research-backed pool;
 * the other ~50% it uses a generic positive response so repeated days in
 * the same category stay fresh.
 * Falls back to generic if the prompt isn't in the theme map.
 * @param {string} promptText - The exact prompt text that was sent
 */
function getPromptPairedResponse(promptText) {
  const theme = promptThemeMap[promptText];
  const themed = theme ? themedResponses[theme] : null;
  if (themed && themed.length > 0 && Math.random() < 0.5) {
    return themed[Math.floor(Math.random() * themed.length)];
  }
  return getRandomPositiveResponse();
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
  getPromptPairedResponse,
  getRandomReminder,
  getStreakMessage,
};
