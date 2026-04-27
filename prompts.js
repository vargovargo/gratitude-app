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
  // New prompts (2026)
  // simple_pleasures
  "Good morning! 🫖 What's a small ritual that makes your mornings feel a little better?": 'simple_pleasures',
  "What's a scent that instantly makes you feel at home or at ease?": 'simple_pleasures',
  "Good morning! 🌤️ What's one thing about today's weather — whatever it is — that you can find to appreciate?": 'simple_pleasures',
  "Morning! 🎧 What song or piece of music has been bringing you joy lately?": 'simple_pleasures',
  "What's a texture, temperature, or physical sensation you secretly love?": 'simple_pleasures',
  "Good morning! 🍳 What's the last meal you made that you were genuinely pleased with?": 'simple_pleasures',
  "What's something you read, watched, or listened to recently that was just... enjoyable?": 'simple_pleasures',
  "Morning! 🛋️ What's your favorite spot in your home, and what do you love about it?": 'simple_pleasures',
  "What's a small thing you do for yourself regularly that makes your day a bit easier?": 'simple_pleasures',
  "Look up from your phone for a moment. What's the first thing you see that you're glad exists?": 'simple_pleasures',
  "What's something you walk past every day that you've stopped noticing but would miss if it were gone?": 'simple_pleasures',
  "Morning! ☕ What's something you eat or drink that you genuinely look forward to each day?": 'simple_pleasures',
  "What's a chore or task you actually find a little satisfying to do?": 'simple_pleasures',
  "Good morning! 🎶 What's something you enjoy doing when you have a few unexpected free minutes?": 'simple_pleasures',
  "What's something about your everyday surroundings that you've never once thought to be grateful for, but which is quietly good?": 'simple_pleasures',
  "Morning! 🌬️ When did you last step outside and just notice something pleasant about the air, the light, or the quiet?": 'simple_pleasures',
  "What's something around your home that makes you smile when you see it?": 'simple_pleasures',
  "Good morning! 🏡 What's one way your living space supports you that you rarely stop to notice?": 'simple_pleasures',
  "What's a small purchase — something inexpensive — that's added real quality to your life?": 'simple_pleasures',
  "Morning! 🧩 What's an activity you lose track of time doing that you're grateful exists?": 'simple_pleasures',
  "What's something about your neighborhood or local area that you appreciate?": 'simple_pleasures',
  "Good morning! 🌿 What's a plant, garden, or green space near you that you're glad is there?": 'simple_pleasures',
  "What's a sound in your daily environment that you actually like?": 'simple_pleasures',
  "Morning! 📖 What's something you read recently — a book, an article, even a caption — that stuck with you in a good way?": 'simple_pleasures',
  "What's a piece of technology that quietly makes your life better in ways you rarely acknowledge?": 'simple_pleasures',
  "Good morning! 🛁 What's a small comfort that helps you recharge or unwind?": 'simple_pleasures',
  "What's a small pleasure you've had in the last 24 hours that you've already moved past without fully registering?": 'simple_pleasures',
  "What's something you have access to today — a place, a person, a comfort — that you'd feel the absence of immediately if it were gone?": 'simple_pleasures',
  // relationships
  "Think of someone you spoke to yesterday — even briefly. What did you appreciate about that exchange?": 'relationships',
  "Who's someone you could call right now if you really needed to? What does it mean to have that?": 'relationships',
  "Good morning! 💬 What's something a specific person in your life has said that you still think about?": 'relationships',
  "Who checked in on you recently — in any way — that you haven't fully acknowledged, even to yourself?": 'relationships',
  "Morning! 🤝 What's one relationship in your life that costs you very little but gives you a lot?": 'relationships',
  "Think of someone you've known for a long time. What's one thing you know about them now that you didn't at first?": 'relationships',
  "Who in your life is easy to be around? What makes them that way?": 'relationships',
  "Good morning! What's something someone did for you in the last week — even something small — that you haven't said thank you for?": 'relationships',
  "Morning! Is there someone in your life who's been more patient with you than you deserved? Who, and when?": 'relationships',
  "Think of a friendship that's changed over the years but is still there. What's kept it going?": 'relationships',
  "Who do you feel genuinely seen by? What does that feel like?": 'relationships',
  "Good morning! 👋 Who's someone on the edges of your life — a neighbor, a regular at a place you go — that you'd notice the absence of?": 'relationships',
  "Morning! What's something a family member taught you, by example, that you still carry?": 'relationships',
  "Think of the last time you laughed with someone. Who was it and what made it funny?": 'relationships',
  "Good morning! Who's someone you've drifted from but would still show up for? What does that say about the relationship?": 'relationships',
  "Morning! 🌱 What's a relationship that's grown or deepened in the last year or two?": 'relationships',
  "Who gave you honest feedback when you needed it, even if it was uncomfortable? What did that cost them?": 'relationships',
  "Good morning! What's one way someone in your life makes ordinary tasks or days easier without making a big deal of it?": 'relationships',
  "Morning! Think of a person you admire. What specifically do you admire — a quality, a decision, a habit?": 'relationships',
  "Who have you forgiven, or been forgiven by, in a way that changed how you think about the relationship?": 'relationships',
  "Good morning! 🫂 What's something you've been meaning to say to someone — appreciation, acknowledgment, anything — that you've kept putting off?": 'relationships',
  "Morning! Who's someone you're glad came into your life unexpectedly?": 'relationships',
  "Think of someone who showed up for you during a hard time. What specifically did they do?": 'relationships',
  "Good morning! What's one relationship in your life that's better now than it was a year ago? What changed?": 'relationships',
  "Morning! Who is someone in your life that doesn't get enough credit for what they do?": 'relationships',
  "Think of the last time someone made you feel genuinely welcomed or included. Who was it?": 'relationships',
  "Good morning! 🌟 What's something you genuinely like about someone you find difficult?": 'relationships',
  "Morning! Who's someone you'd describe as generous — not just with money, but with time, attention, or patience?": 'relationships',
  // resilience
  "Think of something hard you've already gotten through. What did you find out about yourself from it?": 'resilience',
  "What's something you handled in the last month that you weren't sure you could?": 'resilience',
  "Good morning! What's a worry you had six months ago that turned out okay — or that you've just learned to live with?": 'resilience',
  "Morning! What's one small thing you did yesterday that took more effort than it looked?": 'resilience',
  "Think of a time you asked for help when it wasn't easy to. What happened?": 'resilience',
  "Good morning! What's something you used to struggle with that's easier now — even slightly?": 'resilience',
  "What's a skill or capacity you have today that came from going through something difficult?": 'resilience',
  "Morning! 💪 What's something you kept showing up for even when you didn't feel like it?": 'resilience',
  "Think of a setback that ended up pointing you in a better direction. What did that look like?": 'resilience',
  "Good morning! What's something you've adapted to that you didn't think you could adapt to?": 'resilience',
  "Morning! What's a belief you've let go of — about yourself or the world — that was actually weighing you down?": 'resilience',
  "What's a time you surprised yourself — not with a triumph, just by getting through something?": 'resilience',
  "Good morning! Who or what helped you get through a hard stretch? What did that support actually look like?": 'resilience',
  "Morning! What's something you've rebuilt — a habit, a relationship, a routine — after it broke down?": 'resilience',
  "Think of a hard decision you made that you weren't sure about at the time. What do you know now?": 'resilience',
  "Good morning! What's something you've been dealing with that you're handling better than you might be giving yourself credit for?": 'resilience',
  "Morning! 🌤️ What's a hard thing that, looking back, gave you something you wouldn't trade?": 'resilience',
  "What's a problem you've been sitting with for a while that's actually gotten smaller without you fully noticing?": 'resilience',
  "Good morning! What's one way your life is more manageable now than it was a year or two ago?": 'resilience',
  "Morning! Think of a time you kept your word to yourself about something hard. What was it?": 'resilience',
  "What's something you've stopped doing — a habit, a relationship, a pattern — that made things better?": 'resilience',
  "Good morning! What's a piece of hard-won knowledge you'd tell a younger version of yourself?": 'resilience',
  "Morning! What's an obstacle in your life right now that you're actually making progress on, even if it's slow?": 'resilience',
  "Think of something you failed at but tried again. What made you try again?": 'resilience',
  "Good morning! What's something you're carrying right now that you've been carrying longer than you realized — and you're still standing?": 'resilience',
  "Morning! 🔧 What's a practical skill or resource you have that you built up over time without fully noticing?": 'resilience',
  "What's a time you changed your mind about something important? What shifted?": 'resilience',
  "Good morning! What's something you've made peace with that used to take up more of your energy?": 'resilience',
  // body
  "Before you get up: take one slow breath and notice where your body feels at ease right now. What do you feel?": 'body',
  "Morning! 🌿 What's one thing your body did yesterday that you took for granted — something it just handled?": 'body',
  "Take 10 seconds. Close your eyes, breathe in, breathe out slowly. What do you notice in your chest or shoulders?": 'body',
  "Good morning! What's the most physical thing you did yesterday — a walk, stairs, lifting something? What did it feel like to be able to do it?": 'body',
  "Morning! Think of something your hands can do that someone once had to teach you. What is it?": 'body',
  "What's something about your senses — sight, hearing, smell, taste, touch — that you leaned on today without noticing?": 'body',
  "Good morning! 🛏️ Pause for a moment. Feel the weight of your body where you're sitting or lying. What's one thing you notice?": 'body',
  "Morning! What's a way your body signals to you that it needs rest — and are you listening to it today?": 'body',
  "Think of a physical experience from the last week that was just pleasant — warmth, cool air, a good stretch. What was it?": 'body',
  "Good morning! What's something your body healed from or recovered from at some point — even something minor?": 'body',
  "Morning! 🦶 Take three slow breaths right now. In through the nose, out through the mouth. What shifted?": 'body',
  "What's a physical capacity — walking a certain distance, lifting, reaching — that you'd miss immediately if it were gone?": 'body',
  "Good morning! What did you eat yesterday that your body probably needed? Did you notice it at the time?": 'body',
  "Morning! What's a physical sensation you've experienced recently that was just simply good — nothing profound, just good?": 'body',
  "Think of a time your body surprised you by being stronger or more capable than you expected. When was that?": 'body',
  "Good morning! 🧘 Before you read anything else today: sit for one moment and just feel your feet on the floor. What's there?": 'body',
  "Morning! What's something your body does automatically every day that would require extraordinary technology to replicate?": 'body',
  "What's a physical activity you've done in the past week — any activity — that your body was built for?": 'body',
  "Good morning! Think of a part of your body that you usually ignore but which is, right now, just doing its job. What do you notice?": 'body',
  "Morning! 💤 What's something about how you slept last night — even imperfectly — that still served you?": 'body',
  "What's a smell or taste that your body seems to respond to before your mind catches up?": 'body',
  "Good morning! What's a small physical comfort you have access to today — a chair, a bed, warmth — that you didn't earn so much as inherit?": 'body',
  "Morning! What's something you can do physically now that you couldn't do, or couldn't do as easily, a few years ago?": 'body',
  "Take a slow breath and let your shoulders drop. Where in your body do you carry tension? Just notice it for a moment.": 'body',
  "Good morning! What's one thing your body did right this week — something it managed, absorbed, or recovered from?": 'body',
  "Morning! 🌅 Step outside or look out a window for 30 seconds. What does your body feel in the light or air?": 'body',
  "What's a physical limitation you've adapted to in a way that you've started to take for granted?": 'body',
  "Good morning! What's something your body has been telling you lately that you've mostly been ignoring?": 'body',
  // nature
  "Step outside or open a window for 30 seconds. What do you hear that you hadn't been paying attention to?": 'nature',
  "Good morning! 🌳 What's one tree, plant, or patch of green that you walk past regularly and have never really looked at?": 'nature',
  "Morning! What's the sky like right now — color, light, cloud — even through a window? Just notice it for a moment.": 'nature',
  "What's a natural feature of where you live that you'd bring up if someone asked what you like about the place?": 'nature',
  "Good morning! 🌿 What's something alive — a plant, a bird, an insect — that you've noticed in the last few days?": 'nature',
  "Stop for 10 seconds. Listen. What sounds in your environment come from something natural rather than human-made?": 'nature',
  "Morning! What's the last time you were somewhere with more nature than you're used to? What do you remember?": 'nature',
  "Good morning! 🌧️ What's a kind of weather — rain, fog, cold, heat — that you usually treat as a problem but could find something in?": 'nature',
  "Morning! What's a plant you've kept alive, or that grows near you without help, that you've stopped noticing?": 'nature',
  "Think of a place outdoors that you feel comfortable in. What specifically do you like about it?": 'nature',
  "Good morning! What's something about the season you're in right now that's actually good, even if it's not your favorite?": 'nature',
  "Morning! 🐦 Have you noticed any birds or animals near you recently? What were they doing?": 'nature',
  "What's a smell outside — earth, rain, cut grass, salt air — that stops you even briefly?": 'nature',
  "Good morning! What's one way the natural world near you has changed in the last few weeks?": 'nature',
  "Morning! Go to a window for a moment. What's one natural thing you can see from where you are?": 'nature',
  "What's something about where you live — geography, climate, light — that's a quiet background benefit?": 'nature',
  "Good morning! 🌙 What's something about nights where you are — stars, quiet, cool air — that you rarely notice?": 'nature',
  "Morning! Think of a place in nature that's within reach of where you live. When did you last go?": 'nature',
  "What's something that grows without anyone tending it near you — weeds, wildflowers, ivy — that's actually kind of remarkable?": 'nature',
  "Good morning! 🌊 What's a body of water — river, lake, ocean, even a fountain — near you that you rarely acknowledge?": 'nature',
  "Morning! What's the quality of light like right now where you are? Notice it for just a moment before you move on.": 'nature',
  "What's a natural thing that recurs every year — a season, a bloom, a migration — that you look forward to?": 'nature',
  "Good morning! What's the most recent moment you spent time outside without a specific purpose — just being there?": 'nature',
  "Morning! 🌱 What's one thing about the ground you walk on every day — soil, plants, roots under pavement — that quietly sustains things?": 'nature',
  "Think of a time you were struck by something in nature — a view, a sound, a moment — that you haven't thought about in a while.": 'nature',
  "Good morning! What's something about the natural environment near you that you benefit from without directly noticing?": 'nature',
  "Morning! What's an animal — wild or domestic — that crossed your path recently? What was it doing?": 'nature',
  "Good morning! 🌤️ Step outside or look out for 60 seconds. What's one thing you see that was here long before you were?": 'nature',
  // creativity
  "What's something you made recently — cooked, built, written, arranged — that turned out better than you expected?": 'creativity',
  "Good morning! 🎨 What's a creative skill you have that you don't often think of as a skill?": 'creativity',
  "Morning! When's the last time you made something for someone else — a meal, a gift, a message — that took real thought?": 'creativity',
  "What's a creative project you've started, stopped, and come back to? What keeps pulling you back?": 'creativity',
  "Good morning! What's something you've figured out how to do through trial and error — no instructions, just iteration?": 'creativity',
  "Morning! ✏️ What's something you've written recently — even a text, a note, a list — that you put real care into?": 'creativity',
  "What's a creative habit you have that other people might not think of as creative — organizing, rearranging, improvising?": 'creativity',
  "Good morning! What's something you've made in the last year that still exists somewhere — an object, a photo, a recipe?": 'creativity',
  "Morning! Think of a time you improvised and it worked. What was the situation?": 'creativity',
  "What's something you enjoy making that has no practical purpose — just the making of it is the point?": 'creativity',
  "Good morning! 🎶 What's a piece of music, art, or writing that someone else made that you keep coming back to?": 'creativity',
  "Morning! What's a problem you solved recently in a way you're a little proud of?": 'creativity',
  "Think of a creative skill you've developed slowly over a long time. Where did it start?": 'creativity',
  "Good morning! What's something you're in the middle of creating right now — anything, any stage?": 'creativity',
  "Morning! 🛠️ What's something you've repaired, adapted, or repurposed rather than replaced?": 'creativity',
  "What's the last thing you made that someone else reacted to positively? What did that feel like?": 'creativity',
  "Good morning! What's an idea you've had recently that surprised you a little?": 'creativity',
  "Morning! What's something you've learned to do that involves your hands?": 'creativity',
  "Think of a creative person in your life — not a famous one, just someone you know. What do you admire about how they make things?": 'creativity',
  "Good morning! 📸 What's an image, photo, or visual memory from the last week that sticks with you?": 'creativity',
  "Morning! What's something you've made where the process was better than the result?": 'creativity',
  "What's a creative thing you did as a kid that you haven't thought about in a while?": 'creativity',
  "Good morning! What's something you created that didn't work the first time? What did you change?": 'creativity',
  "Morning! 🎭 What's something you know how to do from scratch — bake, build, play, draw — that most people don't?": 'creativity',
  "What's a creative act you've been putting off that you'd feel lighter for having done?": 'creativity',
  "Good morning! What's one way you made your surroundings a bit more your own — anything from a rearranged room to a chosen mug?": 'creativity',
  "Morning! What's something you made a long time ago that you still have or that still exists somewhere?": 'creativity',
  "Good morning! What would you make or create today if you had two free hours and no audience?": 'creativity',
  // memory
  "What's a memory from childhood that comes back to you regularly — not dramatic, just specific?": 'memory',
  "Good morning! What's something from your past that, looking back, was better than you knew at the time?": 'memory',
  "Morning! Think of a place you've lived or spent a lot of time in. What do you miss about it?": 'memory',
  "What's a conversation from the past that you still think about — one that shaped how you see something?": 'memory',
  "Good morning! What's a tradition or ritual from your family or upbringing that you've carried forward in some form?": 'memory',
  "Morning! 📷 What's a photo you have — on your phone or somewhere — that you love looking at?": 'memory',
  "Think of a teacher, coach, or mentor from your past. What's one specific thing they did or said that stayed with you?": 'memory',
  "Good morning! What's something from your past that felt hard at the time but that you're glad happened?": 'memory',
  "Morning! What's a meal, smell, or song that takes you straight back to a specific place or time?": 'memory',
  "What's something you used to do regularly that you don't do anymore but genuinely enjoyed?": 'memory',
  "Good morning! 🏡 What's a place from your past — a house, a neighborhood, a landscape — that still feels like home in your memory?": 'memory',
  "Morning! Think of a person who isn't in your life the same way anymore. What do you remember best about them?": 'memory',
  "What's something you learned from a grandparent or older relative that you carry with you?": 'memory',
  "Good morning! What's a book, film, or piece of music that was important to you at a particular time in your life? What made it matter then?": 'memory',
  "Morning! 🌅 What's a trip or time away that stands out in your memory — not because it was perfect, but because of how it felt?": 'memory',
  "What's something you accomplished a long time ago that you rarely give yourself credit for anymore?": 'memory',
  "Good morning! What's a small, ordinary moment from your past — not an event, just a moment — that you're glad you remember?": 'memory',
  "Morning! Think of a friendship from an earlier chapter of your life. What do you remember most?": 'memory',
  "What's something your parents or caregivers did that you didn't appreciate at the time but do now?": 'memory',
  "Good morning! 📚 What's something you knew how to do as a kid or teenager that you no longer do?": 'memory',
  "Morning! What's an experience from your twenties (or your younger years) that fundamentally changed how you see something?": 'memory',
  "Think of a moment when you felt most like yourself — not a peak moment, just recognizably you.": 'memory',
  "Good morning! What's something about where you grew up that shaped you more than you usually acknowledge?": 'memory',
  "Morning! What's a gift — not bought, but given through time or attention — that you received at some point and still remember?": 'memory',
  "What's a hard time in your past that you got through? What does it feel like to be on the other side of it?": 'memory',
  "Good morning! What's an older memory that surfaced recently — something you hadn't thought about in a while?": 'memory',
  "Morning! 🌠 What's something you experienced that you'd want to preserve — not in a photo, but in writing — before it fades?": 'memory',
  "Good morning! What's something about the life you've already lived that you don't give yourself enough credit for?": 'memory',
  // kindness
  "When's the last time someone was patient with you? What did that actually look like?": 'kindness',
  "Good morning! Think of something kind that was done for you recently that you haven't fully acknowledged, even internally.": 'kindness',
  "Morning! What's something small you did for someone recently that probably mattered more than you know?": 'kindness',
  "Who in your life is consistently generous with their time? What does that cost them?": 'kindness',
  "Good morning! 🌸 When's the last time a stranger was kind to you — held a door, gave directions, smiled? What was the moment?": 'kindness',
  "Morning! What's something someone said to you recently that was kinder than it needed to be?": 'kindness',
  "Think of a time you were given the benefit of the doubt. Who gave it, and what did it change?": 'kindness',
  "Good morning! What's something you've done for someone recently that you did without expecting anything back?": 'kindness',
  "Morning! Who in your life shows up consistently — not dramatically, just reliably — in ways that make your life easier?": 'kindness',
  "What's a small kindness you witnessed recently — not directed at you, just something you saw?": 'kindness',
  "Good morning! 💛 What's something you could do for someone today that would take you five minutes but might mean something to them?": 'kindness',
  "Morning! Think of someone who was kind to you during a difficult time. What specifically did they do?": 'kindness',
  "What's an act of kindness you received years ago that you still remember? What made it stick?": 'kindness',
  "Good morning! Is there something kind you've been meaning to do for someone — a note, a call, a small gesture — that you've put off?": 'kindness',
  "Morning! What's a way someone in your life shows care that you rarely name out loud?": 'kindness',
  "Think of something you were kind about to yourself recently. What was it?": 'kindness',
  "Good morning! 🫶 What's something nice someone said about you — even offhandedly — that you held onto?": 'kindness',
  "Morning! When did someone recently make something easier for you without being asked?": 'kindness',
  "What's something you know how to do that you've offered to help someone with?": 'kindness',
  "Good morning! Think of a person who is consistently warm with other people. What does that look like in practice?": 'kindness',
  "Morning! What's something you received this week — attention, time, a favor — that you didn't ask for but needed?": 'kindness',
  "Who is someone in your life who notices things — who picks up on when you're struggling or when something's off?": 'kindness',
  "Good morning! What's a kind thing you've told yourself recently that you'd also say to a friend?": 'kindness',
  "Morning! What's a way you've shown up for someone else lately that you haven't given yourself credit for?": 'kindness',
  "What's something you did for someone that they may not have fully noticed but that you know made a difference?": 'kindness',
  "Good morning! 🌼 When did someone extend grace to you — let something go, or give you another chance?": 'kindness',
  "Morning! What's a small act of care you've built into your daily routine for someone else?": 'kindness',
  "Good morning! What's one person in your life who makes you feel like you don't have to perform or explain yourself?": 'kindness',
  // hope
  "What's something you're genuinely looking forward to in the next few weeks — even something small?": 'hope',
  "Good morning! What's one thing you're working toward right now that matters to you?": 'hope',
  "Morning! What's something that's getting better in your life, even slowly?": 'hope',
  "What's something you'd like to do or try in the next year that you haven't started yet?": 'hope',
  "Good morning! 🌱 What's something you're building — a habit, a skill, a relationship — that you can see growing?": 'hope',
  "Morning! Who's someone in your life whose future you feel genuinely hopeful about?": 'hope',
  "What's a change you made to your life that's playing out better than you expected?": 'hope',
  "Good morning! What's something in the wider world that gives you a bit of hope when you pay attention to it?": 'hope',
  "Morning! What's something you're curious about right now — something you want to know more about?": 'hope',
  "What's a goal that used to feel distant that feels more possible than it did a year ago?": 'hope',
  "Good morning! 🌅 What's something you're looking forward to that's already on the calendar?": 'hope',
  "Morning! What's one thing you've been meaning to start that you could take a first small step toward this week?": 'hope',
  "What's something that's changed in the last year — in your life, in your community — that's a genuine improvement?": 'hope',
  "Good morning! What's something you've been wanting to do with someone specific — a trip, a meal, a conversation?": 'hope',
  "Morning! What's a project or idea you've been thinking about that's slowly becoming clearer?": 'hope',
  "Think of something you're learning right now. How far have you come since you started?": 'hope',
  "Good morning! 🌟 What's something you hope to be true about your life five years from now that's within reach?": 'hope',
  "Morning! What's something you're optimistic about that other people in your life might not be?": 'hope',
  "What's an improvement you've been working toward — in yourself or your circumstances — that's starting to show?": 'hope',
  "Good morning! What's something in the world you find yourself reading about with genuine interest and optimism?": 'hope',
  "Morning! What's something that felt impossible a few years ago that's now part of your ordinary life?": 'hope',
  "What's something you have to look forward to this week, even if it's modest?": 'hope',
  "Good morning! 🌤️ What's a small sign recently — a conversation, a development, a feeling — that something is moving in a good direction?": 'hope',
  "Morning! What's a possibility that's been quietly exciting you lately?": 'hope',
  "What's something you want to do before the year is out? What would make it happen?": 'hope',
  "Good morning! Who's someone younger in your life whose generation gives you genuine hope?": 'hope',
  "Morning! What's a skill or capacity you're developing right now that future-you will be glad you worked on?": 'hope',
  "Good morning! What's something you believed wasn't possible for you that you've since proven wrong?": 'hope',
  // accomplishment
  "What's something you finished recently — fully finished — that you haven't stopped to acknowledge?": 'accomplishment',
  "Good morning! What's one thing you did last week that was harder than it looked to anyone watching?": 'accomplishment',
  "Morning! What's a skill you have now that required real effort to build — one you take for granted?": 'accomplishment',
  "What's something you completed recently that had been sitting unfinished for a while?": 'accomplishment',
  "Good morning! 🏆 What's something you're better at than most people who haven't put in the time you have?": 'accomplishment',
  "Morning! What's a small victory from this week — something that counts even if no one else noticed?": 'accomplishment',
  "Think of something you built over a long time — a practice, a relationship, a body of knowledge. What does it look like now?": 'accomplishment',
  "Good morning! What's something you've been persistent about that's starting to pay off?": 'accomplishment',
  "Morning! What's a decision you made that was right, even though it was hard at the time?": 'accomplishment',
  "What's something you helped someone else accomplish recently?": 'accomplishment',
  "Good morning! What's a professional or practical skill you have that you rarely give yourself credit for?": 'accomplishment',
  "Morning! What's the hardest thing you finished this month — not the biggest, just the one that took the most out of you?": 'accomplishment',
  "Think of something you learned to do well through repetition and failure. When did it start to click?": 'accomplishment',
  "Good morning! ✅ What's something on your list that you've actually been making progress on lately?": 'accomplishment',
  "Morning! What's a goal you set for yourself — any size — that you actually followed through on?": 'accomplishment',
  "What's something you got through this year that you weren't sure you could?": 'accomplishment',
  "Good morning! What's a role or responsibility in your life that you handle more capably than you give yourself credit for?": 'accomplishment',
  "Morning! What's a problem you solved recently — at work, at home, anywhere — that required real thought?": 'accomplishment',
  "Think of something you know how to do from start to finish that took a long time to learn.": 'accomplishment',
  "Good morning! What's something you completed this week — even a single task — that's genuinely done?": 'accomplishment',
  "Morning! 🎯 What's an area of your life where you've made real, sustained progress over the last year?": 'accomplishment',
  "What's something about how you manage your life that's working better than it used to?": 'accomplishment',
  "Good morning! What's something you stuck with longer than felt comfortable — and what came of it?": 'accomplishment',
  "Morning! What's something you've produced, created, or built that you could point to and say: I made that?": 'accomplishment',
  "What's a habit you've maintained — not perfectly, but consistently — that you're quietly proud of?": 'accomplishment',
  "Good morning! What's something you did this week that required courage, even if the stakes were small?": 'accomplishment',
  "Morning! What's the last thing you accomplished that someone else benefited from?": 'accomplishment',
  "Good morning! What's a long-term effort you're in the middle of right now that you'd want future-you to know you didn't give up on?": 'accomplishment',
  // awe
  "Step outside or look up at the sky for a moment. What's there — clouds, light, stars, anything? What do you notice?": 'awe',
  "Good morning! 🌌 What's something you've learned about how the world works that still seems improbable to you?": 'awe',
  "Morning! What's the largest thing you've stood near recently — a building, a mountain, a body of water? What did it feel like to be next to it?": 'awe',
  "What's something that exists because of an enormous, improbable chain of events — something you benefit from every day?": 'awe',
  "Good morning! When did something recently catch you off-guard in a good way — a view, a sound, an unexpected moment of beauty?": 'awe',
  "Morning! What's something about the universe — its size, its age, its workings — that genuinely stops you when you think about it?": 'awe',
  "What's something in ordinary life — a process, a material, a technology — that's actually extraordinary when you slow down and think about it?": 'awe',
  "Good morning! 🌠 Think of the last time you looked at a night sky. What did you feel?": 'awe',
  "Morning! What's something you've witnessed in nature that made you feel small in a good way?": 'awe',
  "What's a piece of music that's moved you in a way that's hard to explain? What did it feel like in your body?": 'awe',
  "Good morning! What's something humans have made — a bridge, a piece of art, a building, a piece of music — that strikes you as genuinely remarkable?": 'awe',
  "Morning! What's something about how living things work — growth, healing, reproduction, communication — that seems almost impossible even though it's ordinary?": 'awe',
  "Stop for a moment. You are a conscious mind that exists, right now, in an incomprehensibly large universe. What's that like to sit with for a second?": 'awe',
  "Good morning! 🌍 What's something about where you live on this planet — its geography, its history, its climate — that's actually astonishing?": 'awe',
  "Morning! What's something you've read or heard recently that genuinely expanded how you see something?": 'awe',
  "What's a time you saw something that made you want to stop and just look for a while?": 'awe',
  "Good morning! What's the oldest thing you've ever touched or stood near? What did it feel like to be in contact with something that old?": 'awe',
  "Morning! 🌋 What's a natural process — weather, tides, seasons, erosion — that you've seen at work and that reminds you how much was here before us?": 'awe',
  "What's a moment in the past year where you felt connected to something larger than your own life?": 'awe',
  "Good morning! What's something simple and immediate — light through a window, the sound of rain, a flame — that, if you look at it long enough, becomes strange and beautiful?": 'awe',
  "Morning! What's something about the human body — yours or in general — that seems improbable or remarkable when you actually think about it?": 'awe',
  "Think of a time you witnessed something being made or built from nothing. What did you feel watching it?": 'awe',
  "Good morning! 🔭 What's a piece of scientific knowledge — something you learned at any point in your life — that changed how you see something?": 'awe',
  "Morning! What's the most beautiful thing you've seen in the last week? Not the most important — just the most beautiful.": 'awe',
  "What's something you'd describe as miraculous — not in a religious sense, just in the sense of being almost unbelievably good?": 'awe',
  "Good morning! What's a time when being somewhere specific — a place, a landscape, a building — changed how you were feeling just by being there?": 'awe',
  "Morning! What's something that exists right now — in your life, in the world — that simply would not have existed fifty years ago?": 'awe',
  "Good morning! 🌅 When did you last feel genuinely amazed by something? What was it?": 'awe',
  // purpose
  "What's something you do regularly that makes a difference to at least one other person?": 'purpose',
  "Good morning! What's something you care about that you could name — not vaguely, but specifically?": 'purpose',
  "Morning! Think of a role you play in someone's life — parent, friend, colleague, neighbor. What does it ask of you?": 'purpose',
  "What's something you're doing now that you think will matter in five years — to you or to someone else?": 'purpose',
  "Good morning! 🧭 What's something you've given time or energy to recently that felt worth it?": 'purpose',
  "Morning! What's something you believe that shapes how you make decisions, even if you've never said it out loud?": 'purpose',
  "Think of a time you helped someone work through something hard. What did you contribute?": 'purpose',
  "Good morning! What's something you've sacrificed or traded for something that mattered more to you?": 'purpose',
  "Morning! What's a cause or concern — big or small — that you actually care about enough to do something about?": 'purpose',
  "What's one thing you'd want people to say about you — not at a funeral, just in general?": 'purpose',
  "Good morning! 🌿 What's something you do in your daily life that connects to something bigger than the task itself?": 'purpose',
  "Morning! What's a project or responsibility you've taken on that challenged you to be more than you thought you were?": 'purpose',
  "What's something you want for the people you care about most? What are you actually doing toward it?": 'purpose',
  "Good morning! What's a value you hold that you've been tested on recently — one you had to actually choose?": 'purpose',
  "Morning! What's something you know from experience that you could offer someone who's earlier in that journey?": 'purpose',
  "Think of a contribution you've made — to a family, a team, a community — that no one formally recognized but that mattered.": 'purpose',
  "Good morning! 🌟 What's something you do that serves a purpose beyond your own comfort or convenience?": 'purpose',
  "Morning! What's something in your life that, when you're doing it, you feel most like yourself?": 'purpose',
  "What's a problem in the world that you care about and that you've done something about, however small?": 'purpose',
  "Good morning! What's something you've been trusted with that you take seriously — a relationship, a responsibility, a piece of knowledge?": 'purpose',
  "Morning! What's a decision you made that was based on what was right rather than what was easy?": 'purpose',
  "What's something you've taught someone — formally or not — that they've carried with them?": 'purpose',
  "Good morning! 🔑 What's something you have that others in different circumstances don't, and what do you do with it?": 'purpose',
  "Morning! What's a role you've grown into over time that now fits you in a way it didn't at first?": 'purpose',
  "What's something you're working toward that isn't just for you?": 'purpose',
  "Good morning! What's something you believe is worth protecting — in your life, in your community, in the world?": 'purpose',
  "Morning! What's a way you contribute that's become so routine you've stopped seeing it as a contribution?": 'purpose',
  "Good morning! What's something you're doing now — even imperfectly — that aligns with who you want to be?": 'purpose',
  // self_compassion
  "What's something you've been hard on yourself about lately that you'd let go of entirely if a friend told you the same story?": 'self_compassion',
  "Good morning! What's one thing you did this week that was genuinely good, that you've already moved past without registering?": 'self_compassion',
  "Morning! What's something you're carrying right now that you didn't choose and can't fully control?": 'self_compassion',
  "Think of something you've been criticizing yourself for. Is that standard the one you'd apply to someone you care about?": 'self_compassion',
  "Good morning! 🌱 What's something you're still learning — a skill, a habit, a way of being — that deserves patience?": 'self_compassion',
  "Morning! What's something your body or mind needed recently that you actually gave it?": 'self_compassion',
  "What's a mistake you made that you've already paid for — in time, in effort, in embarrassment — but that you're still charging yourself for?": 'self_compassion',
  "Good morning! What's something you do to take care of yourself that works, even if it's small or imperfect?": 'self_compassion',
  "Morning! What would you say to a close friend who was in the exact situation you're in right now?": 'self_compassion',
  "What's one thing about yourself — a trait, a way of moving through the world — that you can see as a strength even if others have named it a flaw?": 'self_compassion',
  "Good morning! 💛 What's something you've been doing consistently that deserves acknowledgment, even if no one else has given it?": 'self_compassion',
  "Morning! What's a need you have that's legitimate and that you've been treating as an inconvenience?": 'self_compassion',
  "Think of a version of yourself from a hard period — a year ago, five years ago. What would you want that person to know?": 'self_compassion',
  "Good morning! What's something you've been struggling with that, honestly, most people would struggle with too?": 'self_compassion',
  "Morning! What's something you've done recently that you'd call \"good enough,\" and what would it take to actually accept that?": 'self_compassion',

  "What's a way you've changed in the last few years that you rarely acknowledge as growth?": 'self_compassion',
  "Good morning! 🌸 What's something you're dealing with that you'd have more compassion for if it were someone else?": 'self_compassion',
  "Morning! What do you need today — not what you should want, but what you actually need?": 'self_compassion',
  "What's something you've let yourself off the hook for lately, rightly so?": 'self_compassion',
  "Good morning! What's a limitation you have that you've been treating as a character flaw rather than just a human constraint?": 'self_compassion',
  "Morning! When did you last give yourself credit for something without immediately hedging or adding a \"but\"?": 'self_compassion',

  "What's something about your life right now that's genuinely hard, that you've been minimizing?": 'self_compassion',
  "Good morning! What's a standard you hold yourself to that you'd never expect of anyone else?": 'self_compassion',
  "Morning! 🧘 What's something you could do today that would be genuinely kind to yourself — not a treat, just kind?": 'self_compassion',
  "What's something you've been ashamed of that, on reflection, you don't actually think is shameful?": 'self_compassion',
  "Good morning! What's something you did recently in a difficult moment that showed real character — even if it went unnoticed?": 'self_compassion',
  "Morning! What's one thing you've been avoiding acknowledging about yourself that's actually good?": 'self_compassion',
  "Good morning! What's something you're forgiving yourself for, slowly? What would it look like to speed that up just a little?": 'self_compassion',
};

// ─── Themed responses ─────────────────────────────────────────────────────────
// Paired to the gratitude type each prompt invites. Each theme has a `research`
// bucket (longer, citation-backed) and a `warm` bucket (short, encouraging).
// RESEARCH_RESPONSE_PROBABILITY controls how often the research bucket is used.

const RESEARCH_RESPONSE_PROBABILITY = 0.20;

const themedResponses = {
  awe: {
    research: [
      "That kind of wonder is doing real work. Dacher Keltner's lab at UC Berkeley found that awe — more than any other positive emotion they measured — was linked to lower inflammatory markers in the body. 🌌",
      "Awe is one of the rarest emotions — and one of the most healing. Studies show it shrinks self-focused worry and connects us to something larger than our daily concerns. 🌠",
      "Research by Melanie Rudd (2012, Psychological Science) found that awe literally expands our felt sense of time — people who felt awe reported feeling less rushed and more present. ✨",
    ],
    warm: [
      "A moment like that stays with you for good reason. 🌌",
      "That sense of awe is rare and worth holding onto. ✨",
    ],
  },
  nature: {
    research: [
      "Noticing nature's beauty is more powerful than it sounds. Frances Ming Kuo's research found that even brief access to natural settings measurably restores directed attention and reduces stress markers. 🌿",
      "Nature connectedness consistently predicts life satisfaction and wellbeing across dozens of studies worldwide — the felt sense of belonging to the natural world is genuinely good for you. 🌸",
      "Research shows that even viewing natural scenes can restore attentional capacity — and genuinely noticing nature in the real world carries even stronger benefits. 🌲",
    ],
    warm: [
      "The natural world gives back when you stop to notice it. 🌿",
      "Something about pausing for nature resets things. 🌸",
    ],
  },
  relationships: {
    research: [
      "Calling someone specific to mind deepens the effect. Harvard's 85-year study on adult development found relationships are the single greatest predictor of health and happiness across a lifetime. 💛",
      "Sara Algoe's 'find, remind, and bind' theory shows that gratitude toward specific people strengthens those relationships more powerfully than general thankfulness — and the evidence supports it. 🤝",
      "Research consistently shows that gratitude focused on people — rather than things or circumstances — produces the strongest and most lasting wellbeing benefits. 🌻",
    ],
    warm: [
      "People really are everything. 💛",
      "The ones who show up for us — it means so much. 🌻",
    ],
  },
  resilience: {
    research: [
      "Reflecting on what difficulty gave you is at the heart of post-traumatic growth research. Tedeschi & Calhoun found that finding meaning in hard experiences — not just recovering from them — predicts the deepest long-term psychological gains. 💪",
      "Studies show that reflecting on what hard times taught us — not just surviving them — is linked to lower depression and higher life satisfaction long-term. You just did that. 🌱",
      "Post-traumatic growth research shows that meaning-making from adversity is one of the strongest predictors of resilience and psychological flourishing after difficulty. 🔥",
    ],
    warm: [
      "What hard times teach us stays with us. 💪",
      "Looking back with that lens takes real honesty. 🌱",
    ],
  },
  body: {
    research: [
      "Gratitude for what your body *does* — rather than how it looks — is linked to lower health anxiety and better body image across multiple studies (Tracy Tylka's body appreciation research). 💪",
      "Research links gratitude practice to increased heart rate variability — a marker of parasympathetic activity — and reduced stress hormones. Noticing your body's gifts is part of that. 🌺",
      "Tracy Tylka's research on body appreciation found that gratitude for your body's capabilities — strength, senses, movement — is one of the most stable predictors of positive body image and wellbeing. 🌿",
    ],
    warm: [
      "Our bodies do so much we forget to notice. 🌺",
      "Gratitude for what the body does is its own kind of practice. 🌿",
    ],
  },
  simple_pleasures: {
    research: [
      "Pausing to notice everyday pleasures is the core of 'savoring,' studied by psychologist Fred Bryant. Research shows savoring small moments amplifies positive emotions far more than big, infrequent highs. ✨",
      "Psychologists call this 'hedonic awareness' — and it's one of the most reliable ways to counteract hedonic adaptation, the tendency to stop enjoying what we already have. 🌻",
      "Studies on positive emotion show that small, frequent pleasures contribute more to lasting wellbeing than rare big ones. You just made that small pleasure count. 🌸",
    ],
    warm: [
      "The small stuff really does add up. ✨",
      "Small pleasures are what days are actually made of. 🌻",
    ],
  },
  creativity: {
    research: [
      "Engaging with art, music, or stories activates the brain's default mode network — the same system involved in meaning-making and self-understanding. Reflecting on it extends that benefit. 🎵",
      "A WHO scoping review by Fancourt & Finn (2019) — covering over 3,000 studies — found arts engagement consistently associated with reduced depression, lower cortisol, and stronger positive affect. 🎶",
      "Salimpoor et al. (2011, Nature Neuroscience) found that peak emotional responses to music trigger dopamine release in the brain's reward system — the same pathway activated by food and social connection. 🌟",
    ],
    warm: [
      "Art and music reach places words can't quite get to. 🎵",
      "The things that move us say something real about who we are. 🌟",
    ],
  },
  memory: {
    research: [
      "Researchers studying nostalgia (led by Constantine Sedikides at Southampton) found that nostalgic reflection consistently increases feelings of meaning, social connectedness, and optimism. 🌿",
      "Reflecting on formative memories strengthens what psychologists call 'narrative identity' — the story of who you are — which is closely tied to resilience and wellbeing. 🕊️",
      "Sedikides & Wildschut's nostalgia research found that revisiting meaningful memories reduces loneliness, bolsters self-continuity, and increases meaning in life — effects replicated across cultures. 🌅",
    ],
    warm: [
      "Carrying a memory like that is its own kind of wealth. 🕊️",
      "Some things stay with us for good reason. 🌅",
    ],
  },
  kindness: {
    research: [
      "Recalling kind acts you've done improves wellbeing. Research by Ko, Margolis, Revord & Lyubomirsky (2021) found that remembering past kindness was just as effective a boost as performing new acts. 💛",
      "Keiko Otake's research found that simply *counting* kind acts for one week raised happiness levels — not just doing them, but noticing them. You just noticed one. 🌸",
      "Sonja Lyubomirsky's positive activity research consistently finds that kindness-based interventions — performing or recalling kind acts — are among the most reliable wellbeing boosters in the field. 🤝",
    ],
    warm: [
      "Kindness has a way of coming back around. 💛",
      "Both giving and receiving kindness leave a mark. 🌸",
    ],
  },
  hope: {
    research: [
      "Looking forward to something — even something small — activates the brain's dopamine reward system, which motivates action and builds positive mood. Anticipation is its own form of joy. 🌈",
      "Rick Snyder's hope theory found that goal-directed thinking — having something meaningful to work toward and believing you can get there — is a strong predictor of resilience and recovery from setbacks. 🌟",
      "Fred Bryant's research on 'anticipatory savoring' shows that mentally dwelling on a future positive event generates real positive emotion now — your brain doesn't wait for it to happen. 🌻",
    ],
    warm: [
      "Having something to look forward to changes how today feels. 🌈",
      "Anticipation is its own small joy. 🌟",
    ],
  },
  accomplishment: {
    research: [
      "Albert Bandura's self-efficacy research identified 'mastery experiences' — looking back on capabilities you've built — as the single most powerful source of ongoing confidence. 💪",
      "Martin Seligman's PERMA model identifies accomplishment as one of five pillars of flourishing — and recognizing your own capabilities is central to how this pillar actually supports wellbeing. 🌟",
      "Carol Dweck's research found that noticing how you've grown — recognizing that abilities develop through effort — is the foundation of a growth mindset, which predicts resilience and sustained motivation. 🎯",
    ],
    warm: [
      "Growth tends to be quiet — it's worth pausing to notice. 💪",
      "Looking back at where you started is underrated. 🎯",
    ],
  },
  purpose: {
    research: [
      "Viktor Frankl's logotherapy research found that a sense of meaning and purpose — not happiness — is the deepest source of psychological wellbeing, and that it holds even through suffering. 🧭",
      "Research by Michael Steger (2009) found that people who regularly reflect on the meaning of their actions report higher life satisfaction, lower depression, and greater resilience under stress. 🌟",
      "Roy Baumeister's research distinguishes happiness from meaning: meaningful activities often involve sacrifice, difficulty, and serving others — and they produce more durable wellbeing. 🌿",
    ],
    warm: [
      "What we do for others tends to outlast what we do for ourselves. 🧭",
      "The things worth doing rarely feel easy while you're doing them. 🌟",
    ],
  },
  self_compassion: {
    research: [
      "Kristin Neff's self-compassion research — across hundreds of studies — consistently shows that self-kindness outperforms self-criticism as a motivator. It's also one of the strongest buffers against anxiety and depression. 🌸",
      "Research by Neff & Germer finds that self-compassion activates the caregiving system in the brain — the same neural pathways triggered by receiving kindness from others. You can give it to yourself. 💛",
      "Studies consistently show that people who treat themselves with compassion recover from mistakes faster, are more motivated to improve, and show greater emotional resilience than those who self-criticize. 🌱",
    ],
    warm: [
      "The standard you'd hold a friend to — you deserve that too. 💛",
      "Giving yourself some grace isn't weakness. It's how you keep going. 🌸",
    ],
  },
};

// ─── Short-response nudges ─────────────────────────────────────────────────────
// Sent (50% of the time) when a user's reply is 3 words or fewer, to gently
// invite a bit more depth without making them feel bad for a short answer.

const shortResponseNudges = [
  "That's a great start! What is it about that you appreciate most? A sentence or two helps the feeling really land. 🌱",
  "Love it. What made you think of that today? A little more can help the gratitude sink in deeper. 🌸",
  "Nice one! Can you say a bit more about why? Even a sentence helps the practice go further. ✨",
  "Good one! What's one detail about that you'd want to remember? Writing it out makes it stick. 🌻",
  "That counts! What is it about that you're most grateful for right now? A few more words can make it real. 🌟",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Fixed start date for the prompt cycle. Change PROMPT_EPOCH env var on Railway
// to shift the sequence without a code redeploy (useful after adding prompts).
const PROMPT_EPOCH = process.env.PROMPT_EPOCH || '2026-01-01';

function seededRandom(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const rand = seededRandom(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns the same prompt for everyone on a given date.
 * Uses a fixed epoch + per-cycle seeded shuffle so the order varies each
 * pass through the list and the sequence never resets at New Year.
 * @param {string} dateStr - YYYY-MM-DD
 */
function getDailyPrompt(dateStr) {
  const epoch = new Date(PROMPT_EPOCH + 'T12:00:00');
  const today = new Date(dateStr + 'T12:00:00');
  const totalDays = Math.round((today - epoch) / (1000 * 60 * 60 * 24));

  const cycleLen   = morningPrompts.length;
  const cycleNum   = Math.floor(totalDays / cycleLen);
  const posInCycle = totalDays % cycleLen;

  return seededShuffle(morningPrompts, cycleNum)[posInCycle];
}

function getRandomPositiveResponse() {
  return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
}

/**
 * Returns a response paired to the type of gratitude the prompt invites,
 * picking randomly from that theme's pool (mix of research-backed and short
 * warm responses). Falls back to a generic positive response if the prompt
 * isn't in the theme map.
 * @param {string} promptText - The exact prompt text that was sent
 */
function getPromptPairedResponse(promptText) {
  const theme = promptThemeMap[promptText];
  const pools = theme ? themedResponses[theme] : null;
  if (pools) {
    const useResearch = Math.random() < RESEARCH_RESPONSE_PROBABILITY;
    const pool = (useResearch && pools.research.length > 0) ? pools.research : pools.warm;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return getRandomPositiveResponse();
}

/**
 * Returns a gentle nudge inviting the user to share a bit more.
 * Used when a response is very short (≤ 3 words).
 */
function getShortResponseNudge() {
  return shortResponseNudges[Math.floor(Math.random() * shortResponseNudges.length)];
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
  getShortResponseNudge,
  getRandomReminder,
  getStreakMessage,
};
