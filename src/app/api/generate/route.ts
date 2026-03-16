import { NextRequest, NextResponse } from 'next/server';
import { BrandDNA, Platform } from '@/types';

const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  instagram: `You are an Instagram content strategist. Create engaging Instagram content with:
- A captivating hook in the first line
- Engaging, scannable caption (use line breaks)
- Relevant emojis (don't overdo it)
- 20-30 strategic hashtags in a separate block
- Clear call-to-action
- Keep under 2200 characters
- Consider Reels/Stories/Carousel format suggestions`,

  'youtube-shorts': `You are a YouTube Shorts content strategist. Create viral short-form video scripts with:
- A scroll-stopping hook in the first 1-2 seconds (pattern interrupt or bold claim)
- Vertical video format (9:16 aspect ratio)
- Duration guidance (15s, 30s, or 60s max)
- Clear scene/shot descriptions in brackets
- On-screen text overlay suggestions
- Retention tactics (loops, cliffhangers, quick cuts)
- Strong CTA (subscribe, like, comment)
- Title suggestion optimized for YouTube search/discovery
- Description with relevant keywords and hashtags
- Consider trending Shorts formats and YouTube algorithm preferences`,

  linkedin: `You are a LinkedIn thought leadership strategist. Create professional content with:
- A compelling hook line that drives curiosity
- Professional but conversational tone
- Structured with line breaks for readability
- Data points or insights where relevant
- Personal storytelling elements
- Clear takeaway or lesson
- Engagement question at the end
- 3-5 relevant hashtags
- Keep under 3000 characters`,

  tiktok: `You are a TikTok content strategist. Create viral TikTok scripts with:
- A scroll-stopping hook (first 1-3 seconds)
- Clear scene/shot descriptions in brackets
- Trending audio/sound suggestions
- Text overlay suggestions
- Transition notes
- Trending format references
- Caption with 3-5 hashtags including trending ones
- Keep the energy high and authentic
- Duration guidance (15s, 30s, 60s, or 3min)`,
};

function buildSystemPrompt(platform: Platform, brandDNA: BrandDNA): string {
  const platformInstructions = PLATFORM_INSTRUCTIONS[platform];

  return `${platformInstructions}

You are creating content for a brand with the following DNA:
- Brand Voice: ${brandDNA.voice || 'Not specified'}
- Tone: ${brandDNA.tone || 'Not specified'}
- Core Values: ${brandDNA.values?.join(', ') || 'Not specified'}
- Target Audience: ${brandDNA.targetAudience || 'Not specified'}
- Key Phrases/Keywords: ${brandDNA.keywords?.join(', ') || 'Not specified'}
- Brand Personality: ${brandDNA.personality || 'Not specified'}
- Unique Selling Points: ${brandDNA.uniqueSellingPoints?.join(', ') || 'Not specified'}
- Content Themes: ${brandDNA.contentThemes?.join(', ') || 'Not specified'}

IMPORTANT: All content must authentically reflect this brand's voice, values, and personality. Stay on-brand while optimizing for the platform.

When the user provides a topic or trend, create platform-optimized content that leverages the trend while staying true to the brand identity. Always explain your strategic reasoning briefly after the content.`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, brandDNA, chatHistory } = await req.json();

    if (!prompt || !platform || !brandDNA) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return a simulated response for demo purposes
      return NextResponse.json({
        content: generateDemoContent(platform, brandDNA, prompt),
      });
    }

    const systemPrompt = buildSystemPrompt(platform, brandDNA);

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
        max_tokens: 1500,
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
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateDemoContent(platform: Platform, brandDNA: BrandDNA, prompt: string): string {
  const brandName = brandDNA.voice ? `a ${brandDNA.voice} brand` : 'your brand';

  const templates: Record<Platform, string> = {
    instagram: `📸 **Instagram Post**

✨ ${prompt}

Here's your on-brand Instagram content for ${brandName}:

---

**Hook:** Stop scrolling — this changes everything about ${brandDNA.contentThemes?.[0] || 'your industry'} 👇

${brandDNA.personality ? `Written in your ${brandDNA.personality} brand voice:` : ''}

"${prompt}" isn't just a trend — it's the future. And here's why ${brandDNA.targetAudience || 'your audience'} needs to pay attention...

${brandDNA.values?.length ? `🌟 This aligns with our core values: ${brandDNA.values.join(', ')}` : ''}

${brandDNA.uniqueSellingPoints?.length ? `What makes us different: ${brandDNA.uniqueSellingPoints[0]}` : ''}

💬 Drop a 🔥 if you agree!

---

**Hashtags:**
${brandDNA.keywords?.map(k => `#${k.replace(/\s+/g, '')}`).join(' ') || '#content #brand #growth'}
#instagramgrowth #contentcreator #brandstrategy

**Strategy Note:** This post uses a curiosity-driven hook, aligns with your brand DNA values, and includes a low-barrier CTA to drive engagement.`,

    'youtube-shorts': `🎬 **YouTube Shorts Script**

Here's your viral YouTube Shorts script for ${brandName}:

---

**Title:** "${prompt} — You Need to See This"
**Format:** Vertical (9:16) | Talking head + B-roll
**Duration:** 30-45 seconds

---

**[HOOK — First 2 seconds]**
[Quick zoom into face / pattern interrupt]
"Wait — ${brandDNA.targetAudience || 'nobody'} is talking about this yet."
[Text overlay: "${prompt}"]

**[BUILD — 3-15 seconds]**
[Cut to different angle or B-roll]
"Here's the thing about ${prompt} that most ${brandDNA.targetAudience || 'people'} completely miss..."
${brandDNA.values?.length ? `[Text overlay: "${brandDNA.values[0]}"]` : '[Text overlay: "The truth"]'}

**[VALUE DROP — 15-35 seconds]**
[Quick cuts between points, keep energy high]
${brandDNA.uniqueSellingPoints?.map((usp, i) => `Point ${i + 1}: "${usp}"\n[Text overlay: Key insight ${i + 1}]`).join('\n') || '"Here\'s what actually works..."\n[Text overlay: The strategy]'}

**[CTA + LOOP — Last 5 seconds]**
[Point at camera, lean in]
"Subscribe if you want Part 2 — this changes everything about ${brandDNA.contentThemes?.[0] || 'this topic'}."
[Cut back to hook for seamless loop]

---

**Description:**
${prompt} — ${brandDNA.personality ? `From a ${brandDNA.personality} perspective` : 'What you need to know'}
${brandDNA.keywords?.map(k => `#${k.replace(/\s+/g, '')}`).join(' ') || '#shorts #viral #trending'}
#shorts #youtubeshorts

**Strategy Note:** Uses the "pattern interrupt → value bomb → loop" format that performs well on YouTube Shorts. The seamless loop drives rewatches (boosting algorithm ranking), and the subscribe CTA converts viewers at peak engagement.`,

    linkedin: `💼 **LinkedIn Post**

Here's your professional content for ${brandName}:

---

${brandDNA.personality ? `[${brandDNA.personality} tone]` : ''}

I need to talk about ${prompt}.

Most ${brandDNA.targetAudience || 'professionals'} won't tell you this, but...

The landscape of ${brandDNA.contentThemes?.[0] || 'our industry'} is shifting fast.

Here's what I've learned:

${brandDNA.values?.map((v, i) => `${i + 1}. ${v} isn't optional anymore — it's essential`).join('\n') || '1. Adaptability is key\n2. Authenticity wins\n3. Consistency compounds'}

${brandDNA.uniqueSellingPoints?.length ? `\nOur approach: ${brandDNA.uniqueSellingPoints.join('. ')}` : ''}

The bottom line?

${brandDNA.targetAudience ? `${brandDNA.targetAudience} who embrace this will lead the next wave.` : 'Those who adapt will lead. Those who don\'t will follow.'}

What's your take? 👇

${brandDNA.keywords?.slice(0, 5).map(k => `#${k.replace(/\s+/g, '')}`).join(' ') || '#leadership #innovation #growth'}

---

**Strategy Note:** This uses the "contrarian insight" LinkedIn format — strong hook, structured lessons, and an engagement question. The professional tone matches LinkedIn's audience expectations while staying on-brand.`,

    tiktok: `🎵 **TikTok Script**

Here's your viral TikTok script for ${brandName}:

---

**Format:** Talking head + text overlay
**Duration:** 30-60 seconds
**Suggested Audio:** Trending ambient/motivational

---

**[HOOK — First 2 seconds]**
[Text overlay: "${prompt} — hear me out"]
[Look directly at camera]
"Stop. If you're ${brandDNA.targetAudience || 'watching this'}, you need to hear this."

**[BUILD — 3-15 seconds]**
[Cut to different angle]
"Everyone's talking about ${prompt}, but nobody's talking about THIS part..."
${brandDNA.values?.length ? `[Text overlay: "${brandDNA.values[0]}"]` : '[Text overlay: "The truth"]'}

**[VALUE — 15-40 seconds]**
[Quick cuts between points]
${brandDNA.uniqueSellingPoints?.map((usp, i) => `Point ${i + 1}: "${usp}"\n[Text overlay: Key point ${i + 1}]`).join('\n') || '"Here\'s what actually works..."\n[Text overlay: The real strategy]'}

**[CTA — Last 5 seconds]**
[Point at camera]
"Follow for more ${brandDNA.contentThemes?.[0] || 'tips like this'}. Part 2 drops tomorrow."

---

**Caption:** ${prompt} 🔥 ${brandDNA.keywords?.slice(0, 3).map(k => `#${k.replace(/\s+/g, '')}`).join(' ') || '#trending'} #fyp #viral

**Strategy Note:** Uses the "contrarian take" format trending on TikTok. The quick hook prevents scroll-past, and the series tease ("Part 2") drives follows.`,
  };

  return templates[platform] || 'Content generated successfully. Connect your Anthropic API key for AI-powered generation.';
}
