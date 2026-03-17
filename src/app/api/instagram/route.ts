import { NextRequest, NextResponse } from 'next/server';
import { BrandDNA, InstagramContentType } from '@/types';

const CONTENT_TYPE_PROMPTS: Record<InstagramContentType, string> = {
  post: `You are an elite Instagram content strategist specializing in feed posts. Generate high-performing Instagram post content with:

**CAPTION STRUCTURE:**
- A scroll-stopping first line (hook) — this is the most critical element
- Engaging body with line breaks for readability
- Strategic emoji usage (2-5 per post, contextually relevant)
- A clear call-to-action (comment, share, save, link in bio)
- Keep the caption under 2,200 characters

**HASHTAG STRATEGY:**
- Provide 20-30 hashtags in a separate block
- Mix: 5 broad/popular, 10 mid-range/niche, 10 micro/specific
- Include 2-3 branded hashtag suggestions

**FORMAT SUGGESTIONS:**
- Recommend carousel vs. single image vs. infographic
- If carousel: outline slide-by-slide content (up to 10 slides)
- Suggest image/visual direction for each slide
- Include alt-text suggestions for accessibility

**ENGAGEMENT OPTIMIZATION:**
- Best posting time suggestions
- Save-worthy content elements (tips, data, quotes)
- Comment-driving questions or prompts`,

  story: `You are an elite Instagram Stories strategist. Generate engaging, interactive Story content with:

**STORY SEQUENCE:**
- Plan a multi-frame story sequence (3-7 frames)
- Each frame should have clear visual direction and text overlay
- Build narrative momentum across frames

**FOR EACH FRAME, SPECIFY:**
- Background style (photo, video, solid color, gradient)
- Text overlay content and placement (top, center, bottom)
- Font style suggestion (classic, modern, neon, typewriter, strong)
- Sticker/element suggestions

**INTERACTIVE ELEMENTS (use at least 2):**
- Poll stickers (provide the question + 2 options)
- Quiz stickers (question + multiple choice answers)
- Question box prompts
- Slider emoji ratings
- Countdown timers (for launches/events)
- "Add Yours" template prompts
- Link stickers with CTA text
- Mention/tag suggestions

**STORY-SPECIFIC BEST PRACTICES:**
- Hook in frame 1 (text teaser or bold visual)
- Keep text concise (max 2 lines per frame)
- Use "tap to reveal" progression for engagement
- End with a clear CTA (swipe up, DM, reply, visit link)
- Suggest music/audio mood`,

  reel: `You are an elite Instagram Reels strategist specializing in viral short-form video. Generate Reels content with:

**SCRIPT STRUCTURE:**
- Duration recommendation (15s, 30s, 60s, or 90s)
- Scene-by-scene breakdown with timestamps
- Exact spoken dialogue/voiceover script
- On-screen text overlay for each scene

**HOOK (First 1-3 seconds):**
- Pattern interrupt or curiosity gap
- Bold text overlay suggestion
- Movement/action to stop the scroll

**BODY CONTENT:**
- Clear scene transitions (cut, swipe, zoom, pan)
- B-roll/visual suggestions for each scene
- Pacing notes (fast cuts vs. slow reveals)
- "Green screen" or trending effect suggestions

**AUDIO & MUSIC:**
- Trending audio suggestions (describe the vibe/genre)
- Original audio script if talking head
- Sound effect suggestions for transitions
- Music mood and tempo recommendations

**CAPTIONS & HASHTAGS:**
- Reel caption (shorter, punchier than feed posts)
- 10-15 relevant hashtags
- Cover image text suggestion

**VIRAL ELEMENTS:**
- Trending format references (POV, "things that...", tutorial, etc.)
- Series potential ("Part 1 of...")
- Share-worthy or save-worthy angle
- Duet/stitch opportunities`,
};

function buildInstagramSystemPrompt(contentType: InstagramContentType, brandDNA: BrandDNA): string {
  return `${CONTENT_TYPE_PROMPTS[contentType]}

You are creating content for a brand with the following DNA:
- Brand Voice: ${brandDNA.voice || 'Not specified'}
- Tone: ${brandDNA.tone || 'Not specified'}
- Core Values: ${brandDNA.values?.join(', ') || 'Not specified'}
- Target Audience: ${brandDNA.targetAudience || 'Not specified'}
- Key Phrases/Keywords: ${brandDNA.keywords?.join(', ') || 'Not specified'}
- Brand Personality: ${brandDNA.personality || 'Not specified'}
- Unique Selling Points: ${brandDNA.uniqueSellingPoints?.join(', ') || 'Not specified'}
- Content Themes: ${brandDNA.contentThemes?.join(', ') || 'Not specified'}

IMPORTANT GUIDELINES:
- All content must authentically reflect this brand's voice, values, and personality
- Stay on-brand while optimizing for maximum Instagram engagement
- Provide strategic reasoning after the content explaining WHY each element works
- Format your output clearly with headers and sections for easy reading
- Be specific with visual/creative direction — don't be vague`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, contentType, brandDNA, chatHistory } = await req.json();

    if (!prompt || !contentType || !brandDNA) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        content: generateDemoContent(contentType, brandDNA, prompt),
      });
    }

    const systemPrompt = buildInstagramSystemPrompt(contentType, brandDNA);

    const messages = [
      ...(chatHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: prompt },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json({ error: 'API request failed' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || 'No content generated';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Instagram generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateDemoContent(contentType: InstagramContentType, brandDNA: BrandDNA, prompt: string): string {
  const brandName = brandDNA.voice ? `a ${brandDNA.voice} brand` : 'your brand';

  const templates: Record<InstagramContentType, string> = {
    post: `## 🖼️ Instagram Feed Post

### Hook (First Line)
> Stop scrolling — this changes everything about ${brandDNA.contentThemes?.[0] || 'your industry'} 👇

### Caption
${brandDNA.personality ? `*Written in your ${brandDNA.personality} brand voice:*\n` : ''}
"${prompt}" isn't just a trend — it's a fundamental shift.

And if you're ${brandDNA.targetAudience || 'paying attention'}, here's why it matters:

${brandDNA.values?.map((v, i) => `${i + 1}. **${v}** — This principle is at the core of everything we do`).join('\n') || '1. **Authenticity** — Real always wins\n2. **Consistency** — Show up every single day\n3. **Value** — Give before you ask'}

${brandDNA.uniqueSellingPoints?.length ? `\n✨ What makes us different: ${brandDNA.uniqueSellingPoints[0]}` : ''}

💬 Save this for later & tell us — which point resonates most? Drop a number below 👇

---

### 📐 Format Recommendation
**Carousel (5 slides)**
1. Bold hook statement with gradient background
2. The problem / myth to debunk
3. Key insight #1 with supporting visual
4. Key insight #2 with data/quote
5. CTA slide with your brand mark

### #️⃣ Hashtags
**Popular:** #instagramgrowth #contentmarketing #digitalstrategy #socialmediatips #marketingtips
**Niche:** ${brandDNA.keywords?.slice(0, 5).map(k => `#${k.replace(/\s+/g, '')}`).join(' ') || '#brandstrategy #contentcreation #growthmindset #businesstips #entrepreneurlife'}
**Micro:** #${(brandDNA.voice || 'brand').replace(/\s+/g, '')}tips #${(brandDNA.contentThemes?.[0] || 'content').replace(/\s+/g, '')}strategy #dailyinsights

### 📊 Strategy Notes
- **Carousel format** drives 1.4x more reach than single images
- **"Save this" CTA** boosts algorithm ranking through save signals
- **Numbered list** makes content scannable and save-worthy
- **Best posting time:** Tuesday/Thursday 11am or 7pm in your audience's timezone`,

    story: `## ⏳ Instagram Story Sequence

**Theme:** ${prompt}
**Total Frames:** 6
**Estimated View Time:** 30 seconds
**Music Mood:** ${brandDNA.tone || 'Upbeat'} / Motivational

---

### Frame 1 — Hook 🎯
**Background:** Dark gradient (brand colors)
**Text:** "${prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt} 👀"
**Font:** Strong / Bold
**Placement:** Center
**Element:** "Tap to see" animation GIF

---

### Frame 2 — Context
**Background:** Photo/video of ${brandDNA.contentThemes?.[0] || 'your product/service'}
**Text:** "Here's what most ${brandDNA.targetAudience || 'people'} don't realize..."
**Font:** Modern
**Placement:** Top
**Element:** ⬇️ Arrow sticker pointing down

---

### Frame 3 — Value Point
**Background:** Branded template (solid color + pattern)
**Text:** "${brandDNA.uniqueSellingPoints?.[0] || 'The key insight that changes everything'}"
**Font:** Classic
**Placement:** Center
**Element:** 🔥 Emphasis sticker

---

### Frame 4 — Interactive Poll 📊
**Background:** Gradient with brand colors
**Text:** "Do you agree?"
**Interactive:** Poll Sticker
- Option A: "100% yes 🙌"
- Option B: "Tell me more 🤔"

---

### Frame 5 — Deeper Insight
**Background:** Behind-the-scenes photo/video
**Text:** "${brandDNA.values?.[0] ? `This is why ${brandDNA.values[0]} matters` : "Here's the real truth"}"
**Font:** Typewriter
**Placement:** Bottom
**Element:** Emoji Slider — "🔥 How much do you relate?"

---

### Frame 6 — CTA 🚀
**Background:** Brand logo on gradient
**Text:** "Want the full breakdown?"
**Font:** Strong
**Placement:** Center
**Element:** Link Sticker → "Read More" / Question Box → "What topic next?"

---

### 📊 Strategy Notes
- **6-frame sequence** keeps completion rate high without drop-off
- **Poll on Frame 4** drives 20-40% engagement boost
- **Progressive reveal** builds curiosity and reduces swipe-away
- **Question box CTA** generates DM conversations for algorithm boost`,

    reel: `## 🎬 Instagram Reel Script

**Topic:** ${prompt}
**Duration:** 30 seconds
**Format:** Talking Head + B-Roll Cutaways
**Trending Style:** "Things you need to know" / Educational
**Cover Image Text:** "${prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}"

---

### 🎬 Scene 1 — HOOK [0:00-0:03]
**[Camera: Close-up, direct eye contact]**
**Text Overlay:** "${prompt} — watch this 👇"
**Script:** "Stop. If you're ${brandDNA.targetAudience || 'watching this'}, you NEED to hear this."
**Transition:** Quick zoom cut →

---

### 🎬 Scene 2 — SETUP [0:03-0:08]
**[Camera: Medium shot, slight angle change]**
**Text Overlay:** "The truth about ${brandDNA.contentThemes?.[0] || 'this'}..."
**Script:** "Everyone's been talking about ${prompt}, but nobody's mentioning THIS part..."
**Transition:** Swipe transition →

---

### 🎬 Scene 3 — VALUE POINT 1 [0:08-0:15]
**[Camera: B-roll of ${brandDNA.contentThemes?.[0] || 'relevant visuals'} + voiceover]**
**Text Overlay:** "${brandDNA.values?.[0] || 'Key insight #1'}"
**Script:** "${brandDNA.uniqueSellingPoints?.[0] || 'Here\'s what actually makes the difference...'}"
**Effect:** Slight slow-mo on key moment
**Transition:** Jump cut →

---

### 🎬 Scene 4 — VALUE POINT 2 [0:15-0:22]
**[Camera: Back to talking head, energetic]**
**Text Overlay:** "Game changer 🔥"
**Script:** "${brandDNA.uniqueSellingPoints?.[1] || 'And this is the part that changes everything for'} ${brandDNA.targetAudience || 'you'}..."
**Transition:** Quick cuts between points →

---

### 🎬 Scene 5 — CTA [0:22-0:30]
**[Camera: Close-up, lean into camera]**
**Text Overlay:** "Follow for more ${brandDNA.contentThemes?.[0] || 'tips'} 🚀"
**Script:** "Follow for Part 2 — I'm breaking down exactly how to ${brandDNA.contentThemes?.[1] || 'make this work for you'}. Save this so you don't forget."
**End Card:** Brand logo + "Follow" animation

---

### 🎵 Audio Suggestion
**Style:** ${brandDNA.tone || 'Energetic'}, trending lo-fi beat or motivational instrumental
**Alternative:** Original audio (speaking) — boosts reach for new accounts

### 📝 Reel Caption
${prompt} — and most ${brandDNA.targetAudience || 'people'} don't even know it yet 🤯

Save this for later ✅ Share with someone who needs this 🔁

### #️⃣ Hashtags
${brandDNA.keywords?.slice(0, 5).map(k => `#${k.replace(/\s+/g, '')}`).join(' ') || '#reels #trending #tips'} #instagramreels #reelsinstagram #viral #fyp #${(brandDNA.contentThemes?.[0] || 'content').replace(/\s+/g, '')}

### 📊 Strategy Notes
- **30-second duration** hits the sweet spot for completion rate + reach
- **"Part 2" tease** drives follows (+15-25% follow rate)
- **Save CTA** signals high value to the algorithm
- **Original audio** with trending format = best of both worlds
- **3-second hook** critical — 65% of viewers decide to stay or leave here`,
  };

  return templates[contentType] || `Instagram content for ${brandName} generated. Connect your Anthropic API key for AI-powered generation.`;
}
