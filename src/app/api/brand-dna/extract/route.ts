import { NextRequest, NextResponse } from 'next/server';
import { BrandDNA } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      // Demo mode: return simulated extraction
      return NextResponse.json({
        brandDNA: generateDemoBrandDNA(url),
      });
    }

    // Fetch the webpage content
    let pageContent = '';
    try {
      const pageResponse = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandDNA/1.0)' },
      });
      const html = await pageResponse.text();
      // Strip HTML tags for a rough text extraction
      pageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000);
    } catch {
      return NextResponse.json({ error: 'Could not fetch the provided URL' }, { status: 400 });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: `You are a brand strategist. Analyze the following webpage content and extract the brand's DNA. Return ONLY valid JSON with this exact structure:
{
  "voice": "description of brand voice",
  "tone": "description of tone",
  "values": ["value1", "value2", "value3"],
  "targetAudience": "description of target audience",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "personality": "brand personality description",
  "uniqueSellingPoints": ["usp1", "usp2"],
  "contentThemes": ["theme1", "theme2", "theme3"]
}`,
          },
          {
            role: 'user',
            content: `Analyze this webpage content and extract the brand DNA:\n\nURL: ${url}\n\nContent:\n${pageContent}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'API request failed' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';

    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse brand DNA' }, { status: 500 });
    }

    const brandDNA: BrandDNA = { ...JSON.parse(jsonMatch[0]), sourceUrl: url };
    return NextResponse.json({ brandDNA });
  } catch (error) {
    console.error('Extract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateDemoBrandDNA(url: string): BrandDNA {
  const domain = new URL(url).hostname.replace('www.', '');
  const brandName = domain.split('.')[0];

  return {
    voice: `Professional yet approachable — ${brandName} speaks with authority while remaining accessible`,
    tone: 'Confident, innovative, and customer-centric',
    values: ['Innovation', 'Quality', 'Customer Success', 'Transparency'],
    targetAudience: `Professionals and businesses looking for ${brandName}'s solutions — typically 25-45, tech-savvy, growth-oriented`,
    keywords: [brandName, 'innovation', 'growth', 'solutions', 'quality', 'results'],
    personality: 'A trusted advisor who combines expertise with genuine care — think knowledgeable friend meets industry expert',
    uniqueSellingPoints: [
      `${brandName}'s unique approach to solving industry challenges`,
      'Customer-first philosophy with proven results',
      'Cutting-edge technology meets human touch',
    ],
    contentThemes: [
      'Industry insights and trends',
      'Customer success stories',
      'Behind-the-scenes innovation',
      'Expert tips and how-tos',
    ],
    sourceUrl: url,
  };
}
