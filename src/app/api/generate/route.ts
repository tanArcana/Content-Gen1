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

  twitter: `You are an X/Twitter content strategist. Create viral-worthy tweets with:
- A strong hook that stops the scroll
- Punchy, concise language (280 char limit for single tweets)
- If a thread is appropriate, format as numbered tweets
- Strategic use of trending formats
- 1-3 relevant hashtags max
- Engagement-driving questions or CTAs
- Consider quote-tweet and reply strategies`,

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
    const { prompt, platform, brandDNA, chatHistory, contentFormat, toneOverride } = await req.json();

    if (!prompt || !platform || !brandDNA) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Return a simulated response for demo purposes
      return NextResponse.json({
        content: generateDemoContent(platform, brandDNA, prompt),
      });
    }

    let systemPrompt = buildSystemPrompt(platform, brandDNA);

    if (contentFormat) {
      systemPrompt += `\n\nCONTENT FORMAT: Create this content specifically as a "${contentFormat}" format. Adapt structure, length, and style accordingly.`;
    }
    if (toneOverride) {
      systemPrompt += `\n\nTONE OVERRIDE: Use a "${toneOverride}" tone for this piece, adjusting the brand voice accordingly while staying authentic.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: prompt },
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        max_tokens: 1500,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return NextResponse.json({ error: 'API request failed' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No content generated';

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

    twitter: `🐦 **X/Twitter Post**

Here's your on-brand tweet for ${brandName}:

---

**Single Tweet:**
${brandDNA.personality ? `[${brandDNA.personality} voice]` : ''}

${prompt}?

Most ${brandDNA.targetAudience || 'people'} get this wrong.

The truth: ${brandDNA.uniqueSellingPoints?.[0] || 'It\'s simpler than you think.'}

${brandDNA.keywords?.[0] ? `#${brandDNA.keywords[0].replace(/\s+/g, '')}` : '#trending'}

---

**Thread Option (1/4):**
🧵 "${prompt}" — a thread on why this matters:

1/ The old way of thinking about ${brandDNA.contentThemes?.[0] || 'this'} is broken.

2/ Here's what ${brandDNA.targetAudience || 'smart people'} are doing instead...

3/ ${brandDNA.values?.[0] ? `It starts with ${brandDNA.values[0]}.` : 'It starts with a mindset shift.'}

4/ ${brandDNA.uniqueSellingPoints?.[0] || 'The results speak for themselves.'}

Repost if this resonates ♻️

**Strategy Note:** The single tweet uses contrarian framing to stop the scroll. The thread option provides deeper value for higher engagement.`,

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

  return templates[platform] || 'Content generated successfully. Connect your OpenRouter API key for AI-powered generation.';
}
