const { PLATFORMS } = require('../config/platforms');

// Built-in AI content generation using template-based intelligent generation
// Can be swapped for OpenAI/Anthropic API calls via AI_PROVIDER env var

const HOOKS = {
  twitter: [
    'Hot take:', 'Unpopular opinion:', 'Thread 🧵:', 'PSA:',
    'Let\'s talk about', 'Here\'s what nobody tells you about',
    'The truth about', 'Stop scrolling.', 'Read this twice.',
  ],
  instagram: [
    'The secret to', 'POV:', 'Behind the scenes of', 'This changed everything.',
    'Save this for later 📌', 'Double tap if you agree ❤️',
    'Story time ✨', 'Swipe for the reveal →',
  ],
  linkedin: [
    'I failed.', 'Here\'s what I learned after', 'Controversial opinion:',
    'The best advice I ever received:', 'In 2024, I made a decision that',
    'Most people won\'t tell you this about', '3 lessons from',
    'I interviewed 100+ leaders. Here\'s what stands out:',
  ],
  tiktok: [
    'Wait for it...', 'POV:', 'Things that just make sense:',
    'Tell me you\'re a [X] without telling me', 'The [X] hack you NEED:',
    'Story time!', 'Rating [X] out of 10:', 'Day in my life as a',
  ],
  youtube: [
    'In this video,', 'Everything you need to know about',
    'The ultimate guide to', 'I tested [X] for 30 days',
    'Why [X] is changing everything', '[X] vs [X]: Which is better?',
  ],
  facebook: [
    'Can we talk about', 'Who else feels this way?', 'Share if you agree!',
    'Tag someone who needs to see this', 'Throwback to when',
  ],
  pinterest: [
    'The ultimate guide to', 'Easy DIY', 'Must-try',
    'Top tips for', 'How to create the perfect',
  ],
  threads: [
    'Hear me out:', 'Real talk:', 'Okay but why does nobody talk about',
    'Hot take incoming:', 'The thing about',
  ],
};

const HASHTAG_SETS = {
  technology: ['#tech', '#innovation', '#AI', '#digital', '#coding', '#startup', '#future'],
  business: ['#business', '#entrepreneur', '#startup', '#leadership', '#growth', '#strategy'],
  marketing: ['#marketing', '#digitalmarketing', '#branding', '#socialmedia', '#contentcreation'],
  health: ['#health', '#wellness', '#selfcare', '#mentalhealth', '#healthy', '#mindfulness'],
  fitness: ['#fitness', '#workout', '#gym', '#fitlife', '#training', '#motivation'],
  food: ['#foodie', '#recipe', '#cooking', '#delicious', '#homemade', '#foodporn'],
  travel: ['#travel', '#wanderlust', '#explore', '#adventure', '#travelgram', '#vacation'],
  fashion: ['#fashion', '#style', '#ootd', '#trendy', '#fashionista', '#outfit'],
  education: ['#education', '#learning', '#knowledge', '#studygram', '#edtech', '#teach'],
  finance: ['#finance', '#investing', '#money', '#wealth', '#personalfinance', '#financial'],
};

const EMOJIS = {
  technology: ['💻', '🚀', '🤖', '⚡', '🔮', '📱', '🌐'],
  business: ['📊', '💡', '🎯', '📈', '🤝', '💼', '🏆'],
  marketing: ['📣', '🎨', '✨', '🔥', '💥', '📢', '🎪'],
  health: ['🧘', '💚', '🌿', '❤️', '🧠', '🌸', '✨'],
  fitness: ['💪', '🏋️', '🔥', '⚡', '🏃', '💯', '🎯'],
  food: ['🍕', '🍳', '😋', '👨‍🍳', '🍽️', '❤️', '🔥'],
  travel: ['✈️', '🌍', '🗺️', '🌅', '⛰️', '🏖️', '📸'],
  fashion: ['👗', '✨', '💅', '🎀', '👠', '💎', '🌟'],
  default: ['✨', '🔥', '💡', '🎯', '⚡', '🙌', '💪'],
};

const CTA_TEMPLATES = {
  engagement: [
    'What do you think? Drop your thoughts below 👇',
    'Agree or disagree? Let me know!',
    'Save this for later and share with someone who needs it!',
    'Double tap if this resonates with you ❤️',
    'Tag someone who should see this!',
  ],
  traffic: [
    'Link in bio for the full breakdown 🔗',
    'Check out the full article — link in bio!',
    'Want the complete guide? Link in bio.',
    'Read the full story at the link in my bio.',
  ],
  conversion: [
    'DM me "START" to learn more!',
    'Ready to get started? Click the link in bio.',
    'Limited spots available — sign up today!',
    'Use code SOCIAL20 for 20% off!',
  ],
};

function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

function generateHashtags(topic, platform, count = 5) {
  const topicTags = HASHTAG_SETS[topic] || HASHTAG_SETS.technology;
  const platformTag = `#${platform}`;
  const tags = pickRandom(topicTags, Math.min(count, topicTags.length));
  if (!tags.includes(platformTag)) tags.push(platformTag);
  return tags;
}

function generateEmojis(topic, count = 3) {
  const set = EMOJIS[topic] || EMOJIS.default;
  return pickRandom(set, Math.min(count, set.length));
}

function applyTone(text, tone) {
  switch (tone) {
    case 'professional':
    case 'thought_leader':
      return text.replace(/!/g, '.').replace(/gonna/g, 'going to');
    case 'casual':
    case 'conversational':
      return text.replace(/\. /g, '! ').replace(/However/g, 'But hey');
    case 'witty':
    case 'humorous':
      return text + ' 😏';
    case 'inspirational':
    case 'motivational':
      return text.replace(/\.$/, ' — and so can you. 🌟');
    default:
      return text;
  }
}

function generateTwitterContent(topic, contentType, tone, keywords) {
  const hook = pickRandom(HOOKS.twitter);
  const emojis = generateEmojis(topic, 2);
  const hashtags = generateHashtags(topic, 'twitter', 3);
  const keywordStr = keywords.length > 0 ? keywords[0] : topic;

  if (contentType === 'thread') {
    const tweets = [
      `${hook} ${keywordStr} ${emojis[0]}\n\nA thread on what everyone needs to know 🧵👇`,
      `1/ First, let's address the elephant in the room.\n\n${keywordStr} isn't just a trend — it's reshaping how we think about ${topic}.\n\nHere's why that matters:`,
      `2/ The biggest misconception about ${keywordStr}?\n\nMost people think it's complicated. But once you understand the core principles, everything clicks ${emojis[1]}`,
      `3/ Here's the framework I use:\n\n→ Start with the fundamentals\n→ Test small, iterate fast\n→ Measure what matters\n→ Scale what works`,
      `4/ The results speak for themselves.\n\nPeople who master ${keywordStr} see:\n• Better outcomes\n• Faster progress\n• More consistency\n• Real results`,
      `5/ Want to dive deeper into ${keywordStr}?\n\n${pickRandom(CTA_TEMPLATES.engagement)}\n\n${hashtags.join(' ')}`,
    ];
    return applyTone(tweets.join('\n\n---\n\n'), tone);
  }

  if (contentType === 'poll') {
    return applyTone(
      `${emojis[0]} Quick poll: What's your take on ${keywordStr}?\n\n🔵 Game changer\n🟢 Overhyped\n🟡 Too early to tell\n🔴 Not for me\n\n${hashtags.join(' ')}`,
      tone
    );
  }

  const tweet = `${hook} ${keywordStr}\n\n${emojis[0]} The key insight most people miss: it's not about doing more — it's about doing the right things consistently.\n\n${hashtags.join(' ')}`;
  return applyTone(tweet.slice(0, 280), tone);
}

function generateInstagramContent(topic, contentType, tone, keywords) {
  const hook = pickRandom(HOOKS.instagram);
  const emojis = generateEmojis(topic, 4);
  const hashtags = generateHashtags(topic, 'instagram', 15);
  const keywordStr = keywords.length > 0 ? keywords[0] : topic;

  if (contentType === 'reel_script') {
    return applyTone(
      `🎬 REEL SCRIPT: ${keywordStr}\n\n` +
      `[HOOK - 0-3s]\n"${hook} ${keywordStr}"\n\n` +
      `[SETUP - 3-8s]\nShow the problem or the "before" state.\nText overlay: "Everyone's been doing ${keywordStr} wrong"\n\n` +
      `[VALUE - 8-20s]\nReveal the key insight or transformation.\nStep 1: Start with the basics\nStep 2: Apply the secret technique\nStep 3: Watch the results\n\n` +
      `[CTA - 20-25s]\n"Follow for more ${topic} tips!"\nPoint to follow button\n\n` +
      `CAPTION:\n${emojis[0]} ${hook} ${keywordStr}\n\n` +
      `Here's what changed everything for me ${emojis[1]}\n\n` +
      `${pickRandom(CTA_TEMPLATES.engagement)}\n\n` +
      `.\n.\n.\n${hashtags.join(' ')}`,
      tone
    );
  }

  if (contentType === 'carousel') {
    return applyTone(
      `📱 CAROUSEL POST: ${keywordStr}\n\n` +
      `Slide 1 (Cover): "${keywordStr}: Everything You Need to Know ${emojis[0]}"\n\n` +
      `Slide 2: "The Problem"\nMost people struggle with ${topic} because they don't know where to start.\n\n` +
      `Slide 3: "Step 1"\nStart by understanding the fundamentals. ${emojis[1]} Master the basics before anything else.\n\n` +
      `Slide 4: "Step 2"\nApply what you learn consistently. Small daily actions compound into massive results.\n\n` +
      `Slide 5: "Step 3"\nTrack your progress and adjust. What gets measured gets improved ${emojis[2]}\n\n` +
      `Slide 6: "The Results"\nPeople who follow this framework see real, lasting change.\n\n` +
      `Slide 7 (CTA): "Save this post & share with someone who needs it! ${emojis[3]}"\n\n` +
      `CAPTION:\n${hook} ${keywordStr}\n\nHere's your complete guide 👆\n\n${pickRandom(CTA_TEMPLATES.engagement)}\n\n.\n.\n.\n${hashtags.join(' ')}`,
      tone
    );
  }

  if (contentType === 'story') {
    return applyTone(
      `📱 STORY SEQUENCE: ${keywordStr}\n\n` +
      `Story 1: Poll sticker — "Do you know about ${keywordStr}? YES / NO"\n\n` +
      `Story 2: "${hook}" with countdown sticker\n\n` +
      `Story 3: Key insight about ${keywordStr} with emoji slider ${emojis[0]}\n\n` +
      `Story 4: Quick tip + "Share this story if it helped!" ${emojis[1]}\n\n` +
      `Story 5: CTA — "DM me '${topic.toUpperCase()}' for more tips!" with question box`,
      tone
    );
  }

  return applyTone(
    `${emojis[0]} ${hook} ${keywordStr}\n\n` +
    `Here's what nobody tells you about ${topic}:\n\n` +
    `${emojis[1]} It's not about perfection — it's about progress\n` +
    `${emojis[2]} Consistency beats intensity every single time\n` +
    `${emojis[3]} The best time to start was yesterday. The second best time is now.\n\n` +
    `${pickRandom(CTA_TEMPLATES.engagement)}\n\n` +
    `.\n.\n.\n${hashtags.join(' ')}`,
    tone
  );
}

function generateLinkedInContent(topic, contentType, tone, keywords) {
  const hook = pickRandom(HOOKS.linkedin);
  const hashtags = generateHashtags(topic, 'linkedin', 5);
  const keywordStr = keywords.length > 0 ? keywords[0] : topic;

  if (contentType === 'thought_leadership') {
    return applyTone(
      `${hook} ${keywordStr}.\n\n` +
      `After years of working in ${topic}, here's what I've learned:\n\n` +
      `The companies that win aren't the ones with the most resources.\n` +
      `They're the ones that understand ${keywordStr} at a fundamental level.\n\n` +
      `Here are 5 principles that separate the best from the rest:\n\n` +
      `1️⃣ Start with "why" — not "what"\nUnderstand the problem deeply before jumping to solutions.\n\n` +
      `2️⃣ Embrace the messy middle\nReal progress isn't linear. The teams that push through uncertainty are the ones that break through.\n\n` +
      `3️⃣ Measure outcomes, not outputs\nActivity ≠ progress. Focus on impact, not busywork.\n\n` +
      `4️⃣ Build for adaptability\nThe landscape changes fast. Your approach to ${keywordStr} should too.\n\n` +
      `5️⃣ Invest in people\nTechnology is a multiplier. But people are the foundation.\n\n` +
      `The bottom line? ${keywordStr} isn't just a strategy — it's a mindset.\n\n` +
      `What would you add to this list? I'd love to hear your perspective 👇\n\n` +
      `${hashtags.join(' ')}`,
      tone
    );
  }

  if (contentType === 'article_intro') {
    return applyTone(
      `📝 ARTICLE: The Future of ${keywordStr}\n\n` +
      `${hook}\n\n` +
      `The ${topic} landscape is shifting faster than ever. In this article, I break down:\n\n` +
      `→ Why ${keywordStr} matters more than ever\n` +
      `→ The 3 trends reshaping the industry\n` +
      `→ A practical framework you can implement today\n` +
      `→ Lessons from leaders who got it right\n\n` +
      `Whether you're just getting started or looking to level up, this guide has something for you.\n\n` +
      `Read the full article (link in comments) 👇\n\n` +
      `${hashtags.join(' ')}`,
      tone
    );
  }

  return applyTone(
    `${hook}\n\n` +
    `${keywordStr} is transforming how we approach ${topic}.\n\n` +
    `But here's what most professionals get wrong:\n\n` +
    `They focus on the tools instead of the strategy.\n` +
    `They chase trends instead of building foundations.\n` +
    `They optimize for short-term wins instead of long-term value.\n\n` +
    `The professionals who thrive understand that ${keywordStr} is about:\n\n` +
    `✅ Strategic thinking over tactical execution\n` +
    `✅ Building systems that scale\n` +
    `✅ Continuous learning and adaptation\n\n` +
    `What's your experience with ${keywordStr}? Drop your thoughts below 👇\n\n` +
    `${hashtags.join(' ')}`,
    tone
  );
}

function generateTikTokContent(topic, contentType, tone, keywords) {
  const hook = pickRandom(HOOKS.tiktok);
  const emojis = generateEmojis(topic, 3);
  const hashtags = generateHashtags(topic, 'tiktok', 5);
  const keywordStr = keywords.length > 0 ? keywords[0] : topic;

  if (contentType === 'video_script') {
    return applyTone(
      `🎬 TIKTOK VIDEO SCRIPT: ${keywordStr}\n\n` +
      `[HOOK - First 2 seconds] ⚡\n"${hook} ${keywordStr}"\n(Start with action — no intro, no logo)\n\n` +
      `[PROBLEM - 2-5s]\n"Everyone's been doing ${topic} wrong and here's proof..."\n(Show the common mistake or misconception)\n\n` +
      `[SOLUTION - 5-15s]\n"Here's what you should do instead:"\nStep 1: [Visual demonstration]\nStep 2: [Show the technique]\nStep 3: [Reveal the result]\n\n` +
      `[PAYOFF - 15-20s]\n"And THAT'S how you master ${keywordStr}" ${emojis[0]}\n(Show the transformation / end result)\n\n` +
      `[CTA - 20-22s]\n"Follow for more ${topic} tips!" (Point to follow button)\n\n` +
      `CAPTION: ${hook} ${keywordStr} ${emojis[1]}${emojis[2]} ${hashtags.join(' ')}\n\n` +
      `🎵 SUGGESTED AUDIO: Trending sound / original audio\n📌 POST TIME: 7-9 AM or 7-10 PM`,
      tone
    );
  }

  if (contentType === 'hook') {
    const hooks = [
      `"${hook} ${keywordStr}" — start with THIS to grab attention`,
      `"I can't believe nobody talks about this ${topic} hack..."`,
      `"The ${keywordStr} secret that changed my life..."`,
      `"POV: You just discovered ${keywordStr} and everything makes sense now"`,
      `"If you're into ${topic}, you NEED to know this"`,
    ];
    return applyTone(
      `🪝 TIKTOK HOOKS for ${keywordStr}:\n\n` +
      hooks.map((h, i) => `${i + 1}. ${h}`).join('\n\n') +
      `\n\n💡 TIP: The first 1-2 seconds determine if viewers stay. Use text overlays + movement + a bold statement.\n\n${hashtags.join(' ')}`,
      tone
    );
  }

  return applyTone(
    `${emojis[0]} ${hook} ${keywordStr}\n\n` +
    `This is the ${topic} content you didn't know you needed ${emojis[1]}\n\n` +
    `${pickRandom(CTA_TEMPLATES.engagement)}\n\n` +
    `${hashtags.join(' ')}`,
    tone
  );
}

function generateYouTubeContent(topic, contentType, tone, keywords) {
  const hook = pickRandom(HOOKS.youtube);
  const hashtags = generateHashtags(topic, 'youtube', 5);
  const keywordStr = keywords.length > 0 ? keywords[0] : topic;

  if (contentType === 'video_title') {
    const titles = [
      `${keywordStr}: The Complete Guide (Everything You Need to Know)`,
      `I Tried ${keywordStr} for 30 Days — Here's What Happened`,
      `Why ${keywordStr} Changes Everything About ${topic}`,
      `${keywordStr} Masterclass: From Beginner to Pro`,
      `The TRUTH About ${keywordStr} Nobody Tells You`,
      `Stop Making These ${topic} Mistakes (${keywordStr} Guide)`,
    ];
    return titles.map((t, i) => `Option ${i + 1}: ${t}`).join('\n');
  }

  if (contentType === 'description') {
    return applyTone(
      `${hook} ${keywordStr}! In this video, I break down everything you need to know.\n\n` +
      `⏱️ TIMESTAMPS:\n` +
      `0:00 — Introduction\n` +
      `1:30 — Why ${keywordStr} Matters\n` +
      `4:00 — The Core Principles\n` +
      `7:30 — Step-by-Step Walkthrough\n` +
      `12:00 — Common Mistakes to Avoid\n` +
      `15:00 — Advanced Tips & Tricks\n` +
      `18:00 — Final Thoughts & Next Steps\n\n` +
      `📌 KEY TAKEAWAYS:\n` +
      `→ Understanding the fundamentals of ${keywordStr}\n` +
      `→ Practical strategies you can use today\n` +
      `→ How to avoid the most common pitfalls\n` +
      `→ Advanced techniques for ${topic} professionals\n\n` +
      `📚 RESOURCES MENTIONED:\n` +
      `→ [Resource 1 — Add your link]\n` +
      `→ [Resource 2 — Add your link]\n\n` +
      `🔔 Don't forget to SUBSCRIBE and hit the bell for more ${topic} content!\n\n` +
      `📱 FOLLOW ME:\n` +
      `→ Twitter: @yourhandle\n` +
      `→ Instagram: @yourhandle\n` +
      `→ LinkedIn: /in/yourprofile\n\n` +
      `${hashtags.join(' ')}`,
      tone
    );
  }

  if (contentType === 'script_outline') {
    return applyTone(
      `📝 VIDEO SCRIPT OUTLINE: ${keywordStr}\n\n` +
      `🎯 TARGET LENGTH: 12-15 minutes\n` +
      `🎯 TARGET AUDIENCE: People interested in ${topic}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `ACT 1: THE HOOK (0:00-1:30)\n` +
      `• Open with a bold claim or question about ${keywordStr}\n` +
      `• Share a quick personal anecdote or surprising stat\n` +
      `• Preview what viewers will learn\n` +
      `• "By the end of this video, you'll know exactly how to..."\n\n` +
      `ACT 2: THE CONTEXT (1:30-4:00)\n` +
      `• Explain why ${keywordStr} matters right now\n` +
      `• Share relevant background and context\n` +
      `• Address common misconceptions\n\n` +
      `ACT 3: THE CORE CONTENT (4:00-12:00)\n` +
      `• Point 1: [Foundation concept]\n` +
      `  - Explain with example\n` +
      `  - Show visual/demo\n` +
      `• Point 2: [Key technique]\n` +
      `  - Step-by-step walkthrough\n` +
      `  - Common mistakes to avoid\n` +
      `• Point 3: [Advanced strategy]\n` +
      `  - Real-world application\n` +
      `  - Results and proof\n\n` +
      `ACT 4: THE CLOSE (12:00-14:00)\n` +
      `• Recap the key points\n` +
      `• Actionable next step for viewers\n` +
      `• CTA: "If this was helpful, smash that like button"\n` +
      `• Tease next video topic\n` +
      `• End screen with subscribe + related video`,
      tone
    );
  }

  if (contentType === 'shorts_script') {
    return applyTone(
      `⚡ YOUTUBE SHORTS SCRIPT: ${keywordStr}\n\n` +
      `[0-2s] HOOK: "${hook} ${keywordStr}"\n` +
      `[2-10s] CONTENT: Quick explanation with visual demo\n` +
      `[10-15s] VALUE: The key takeaway\n` +
      `[15-17s] CTA: "Subscribe for more ${topic} tips!"\n\n` +
      `📝 ON-SCREEN TEXT:\n` +
      `"${keywordStr} in 15 seconds"\n\n` +
      `${hashtags.join(' ')}`,
      tone
    );
  }

  return applyTone(
    `📢 COMMUNITY POST:\n\n` +
    `${hook} ${keywordStr}!\n\n` +
    `What topic should I cover next?\n` +
    `👍 More ${topic} content\n` +
    `❤️ Beginner tutorials\n` +
    `😂 Behind the scenes\n` +
    `😮 Industry deep-dives\n\n` +
    `Drop your suggestions below! 👇\n\n` +
    `${hashtags.join(' ')}`,
    tone
  );
}

function generateFacebookContent(topic, contentType, tone, keywords) {
  const hook = pickRandom(HOOKS.facebook);
  const emojis = generateEmojis(topic, 3);
  const hashtags = generateHashtags(topic, 'facebook', 5);
  const keywordStr = keywords.length > 0 ? keywords[0] : topic;

  if (contentType === 'event') {
    return applyTone(
      `🎉 EVENT: ${keywordStr} — Live Session\n\n` +
      `${emojis[0]} Join us for an exclusive deep-dive into ${keywordStr}!\n\n` +
      `📅 Date: [Your Date]\n` +
      `⏰ Time: [Your Time]\n` +
      `📍 Location: [Online/Venue]\n\n` +
      `What you'll learn:\n` +
      `✅ The fundamentals of ${keywordStr}\n` +
      `✅ Practical strategies for ${topic}\n` +
      `✅ Live Q&A with experts\n` +
      `✅ Exclusive resources and takeaways\n\n` +
      `${emojis[1]} This event is perfect for anyone looking to level up their ${topic} game.\n\n` +
      `${emojis[2]} Click "Going" and share with friends who'd benefit!\n\n` +
      `${hashtags.join(' ')}`,
      tone
    );
  }

  return applyTone(
    `${hook} ${keywordStr}? ${emojis[0]}\n\n` +
    `I've been thinking a lot about this lately, and here's what I've realized:\n\n` +
    `The people who succeed with ${topic} aren't necessarily the smartest or most talented. They're the ones who:\n\n` +
    `${emojis[1]} Show up consistently\n` +
    `${emojis[2]} Learn from every setback\n` +
    `${emojis[0]} Help others along the way\n\n` +
    `${keywordStr} is just the beginning. The real magic happens when you take action.\n\n` +
    `${pickRandom(CTA_TEMPLATES.engagement)}\n\n` +
    `${hashtags.join(' ')}`,
    tone
  );
}

function generatePinterestContent(topic, contentType, tone, keywords) {
  const hook = pickRandom(HOOKS.pinterest);
  const hashtags = generateHashtags(topic, 'pinterest', 8);
  const keywordStr = keywords.length > 0 ? keywords[0] : topic;

  if (contentType === 'board_description') {
    return applyTone(
      `${hook} ${keywordStr} | Curated collection of the best ${topic} ideas, tips, and inspiration. ` +
      `Whether you're a beginner or expert, find practical guides, beautiful visuals, and actionable advice. ` +
      `Save your favorites and start your ${topic} journey today!\n\n` +
      `${hashtags.join(' ')}`,
      tone
    );
  }

  if (contentType === 'idea_pin') {
    return applyTone(
      `💡 IDEA PIN: ${keywordStr}\n\n` +
      `Page 1: "${hook} ${keywordStr}"\n` +
      `Page 2: "Step 1 — Start with the basics"\n` +
      `Page 3: "Step 2 — Apply the technique"\n` +
      `Page 4: "Step 3 — See the results"\n` +
      `Page 5: "Save this pin for later! Follow for more ${topic} tips"\n\n` +
      `${hashtags.join(' ')}`,
      tone
    );
  }

  return applyTone(
    `${hook} ${keywordStr} | The ultimate guide to getting started with ${topic}. ` +
    `Learn the best strategies, tips, and techniques that actually work. ` +
    `Perfect for beginners and experts alike. Save now, thank yourself later!\n\n` +
    `${hashtags.join(' ')}`,
    tone
  );
}

function generateThreadsContent(topic, contentType, tone, keywords) {
  const hook = pickRandom(HOOKS.threads);
  const emojis = generateEmojis(topic, 2);
  const hashtags = generateHashtags(topic, 'threads', 3);
  const keywordStr = keywords.length > 0 ? keywords[0] : topic;

  if (contentType === 'thread') {
    const posts = [
      `${hook} ${keywordStr} ${emojis[0]}`,
      `The thing most people get wrong about ${topic}? They think it's about talent.\n\nIt's actually about systems.`,
      `Here's the framework:\n\n→ Clarity on what matters\n→ Consistency in showing up\n→ Courage to iterate`,
      `The results? People who apply this to ${keywordStr} see a complete shift in how they approach ${topic}.`,
      `${emojis[1]} What's your take? Drop your experience below.\n\n${hashtags.join(' ')}`,
    ];
    return applyTone(posts.join('\n\n---\n\n'), tone);
  }

  return applyTone(
    `${hook} ${keywordStr}\n\n` +
    `Most people overcomplicate ${topic}. The truth? Start simple, stay consistent, and iterate.\n\n` +
    `${emojis[0]} What's working for you right now?\n\n` +
    `${hashtags.join(' ')}`,
    tone
  );
}

// Main generation function
function generateContent({ platform, topic, contentType, tone, keywords = [], customPrompt }) {
  const platformConfig = PLATFORMS[platform];
  if (!platformConfig) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  if (!contentType) {
    contentType = platformConfig.contentTypes[0];
  }

  if (!tone) {
    tone = platformConfig.tones[0];
  }

  const generators = {
    twitter: generateTwitterContent,
    instagram: generateInstagramContent,
    linkedin: generateLinkedInContent,
    tiktok: generateTikTokContent,
    youtube: generateYouTubeContent,
    facebook: generateFacebookContent,
    pinterest: generatePinterestContent,
    threads: generateThreadsContent,
  };

  const generator = generators[platform];
  if (!generator) {
    throw new Error(`No generator available for platform: ${platform}`);
  }

  let content = generator(topic, contentType, tone, keywords);

  // If custom prompt provided, prepend context
  if (customPrompt) {
    content = `[Custom direction: ${customPrompt}]\n\n${content}`;
  }

  return {
    platform: platformConfig.name,
    platformId: platform,
    contentType,
    tone,
    topic,
    keywords,
    content,
    characterCount: content.length,
    maxLength: platformConfig.maxLength,
    withinLimit: content.length <= platformConfig.maxLength,
    generatedAt: new Date().toISOString(),
  };
}

// Generate content for ALL platforms at once
function generateAllPlatforms({ topic, tone, keywords = [], customPrompt }) {
  const results = {};
  for (const platformId of Object.keys(PLATFORMS)) {
    const platformConfig = PLATFORMS[platformId];
    const defaultContentType = platformConfig.contentTypes[0];
    const defaultTone = tone || platformConfig.tones[0];
    try {
      results[platformId] = generateContent({
        platform: platformId,
        topic,
        contentType: defaultContentType,
        tone: defaultTone,
        keywords,
        customPrompt,
      });
    } catch (err) {
      results[platformId] = { error: err.message };
    }
  }
  return results;
}

module.exports = { generateContent, generateAllPlatforms };
