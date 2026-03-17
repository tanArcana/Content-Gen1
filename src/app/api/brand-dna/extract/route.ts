import { NextRequest, NextResponse } from 'next/server';
import { BrandDNA } from '@/types';

async function fetchPageContent(url: string): Promise<string> {
  const pageResponse = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandDNA/1.0)' },
  });
  const html = await pageResponse.text();
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both single url and array of urls
    const urls: string[] = body.urls || (body.url ? [body.url] : []);
    const businessName: string = body.businessName || '';
    const businessDescription: string = body.businessDescription || '';

    if (urls.length === 0) {
      return NextResponse.json({ error: 'At least one URL is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        brandDNA: generateDemoBrandDNA(urls, businessName),
      });
    }

    // Fetch content from all URLs in parallel
    const fetchResults = await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const content = await fetchPageContent(url);
          return { url, content };
        } catch {
          return { url, content: `[Could not fetch: ${url}]` };
        }
      })
    );

    const pageContents = fetchResults
      .filter((r): r is PromiseFulfilledResult<{ url: string; content: string }> => r.status === 'fulfilled')
      .map(r => r.value);

    if (pageContents.length === 0) {
      return NextResponse.json({ error: 'Could not fetch any of the provided URLs' }, { status: 400 });
    }

    // Build the combined content for analysis
    const combinedContent = pageContents
      .map(p => `=== URL: ${p.url} ===\n${p.content}`)
      .join('\n\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are an expert brand strategist. Analyze ALL the provided webpage content (from multiple URLs/sources connected to the same business) and synthesize a comprehensive, unified Brand DNA profile.

Consider content from their website, social media profiles, about pages, and any other sources to build the most complete picture of the brand's identity.

${businessName ? `Business Name: ${businessName}` : ''}
${businessDescription ? `Business Description: ${businessDescription}` : ''}

Return ONLY valid JSON with this exact structure:
{
  "voice": "detailed description of brand voice based on how they communicate across all sources",
  "tone": "description of overall tone and emotional register",
  "values": ["value1", "value2", "value3", "value4", "value5"],
  "targetAudience": "detailed description of who they're trying to reach, based on messaging patterns",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "personality": "vivid, specific brand personality description synthesized from all sources",
  "uniqueSellingPoints": ["usp1", "usp2", "usp3"],
  "contentThemes": ["theme1", "theme2", "theme3", "theme4", "theme5"]
}

Be specific and detailed. Pull actual language, phrases, and themes from the content. Don't be generic.`,
        messages: [
          {
            role: 'user',
            content: `Analyze these ${pageContents.length} source(s) connected to the same business and extract a unified Brand DNA:\n\n${combinedContent}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'API request failed' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse brand DNA' }, { status: 500 });
    }

    const brandDNA: BrandDNA = {
      ...JSON.parse(jsonMatch[0]),
      sourceUrl: urls[0],
      sourceUrls: urls,
    };
    return NextResponse.json({ brandDNA });
  } catch (error) {
    console.error('Extract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateDemoBrandDNA(urls: string[], businessName?: string): BrandDNA {
  const primaryUrl = urls[0];
  let domain = 'yourbrand';
  try {
    domain = new URL(primaryUrl).hostname.replace('www.', '');
  } catch { /* ignore */ }
  const name = businessName || domain.split('.')[0];

  const socialPlatforms = urls.filter(u =>
    /instagram|twitter|x\.com|linkedin|tiktok|facebook|youtube/i.test(u)
  );

  return {
    voice: `${name} communicates with confident authority balanced by genuine warmth — speaking as a trusted expert who makes complex ideas accessible and actionable`,
    tone: 'Energetic and optimistic, with substance behind every statement — professional enough to earn trust, conversational enough to feel relatable',
    values: [
      'Innovation with purpose',
      'Radical transparency',
      'Community-first growth',
      'Quality over quantity',
      'Continuous improvement',
    ],
    targetAudience: `Ambitious professionals and creators aged 25-40 who are growth-oriented, digitally native, value authenticity, and actively seek brands that align with their personal values`,
    keywords: [
      name.toLowerCase(),
      'innovation',
      'growth',
      'community',
      'expertise',
      'authenticity',
      'results',
    ],
    personality: `${name} is the sharp, passionate friend who always knows what's next — combines deep expertise with infectious enthusiasm, never talks down to anyone, and genuinely celebrates others' wins`,
    uniqueSellingPoints: [
      `${name}'s distinctive blend of deep expertise and approachable communication style`,
      'A proven track record of turning insights into actionable outcomes',
      'Community-driven approach that turns customers into advocates',
    ],
    contentThemes: [
      'Industry insights and bold predictions',
      'Behind-the-scenes process reveals',
      'Quick wins and actionable tips',
      'Customer success spotlights',
      'Myth-busting and contrarian takes',
    ],
    sourceUrl: primaryUrl,
    sourceUrls: urls,
  };
}
