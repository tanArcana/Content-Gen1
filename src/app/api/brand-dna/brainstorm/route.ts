import { NextRequest, NextResponse } from 'next/server';
import { BrandDNA } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { businessName, description, industry, audience } = await req.json();

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        brandDNA: generateDemoBrainstorm(businessName, description, industry, audience),
      });
    }

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
        system: `You are an expert brand strategist. Based on the business information provided, create a comprehensive Brand DNA. Return ONLY valid JSON with this exact structure:
{
  "voice": "description of ideal brand voice",
  "tone": "description of ideal tone",
  "values": ["value1", "value2", "value3", "value4"],
  "targetAudience": "detailed description of target audience",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "personality": "vivid brand personality description",
  "uniqueSellingPoints": ["usp1", "usp2", "usp3"],
  "contentThemes": ["theme1", "theme2", "theme3", "theme4"]
}`,
        messages: [
          {
            role: 'user',
            content: `Create a Brand DNA for this business:\n\nBusiness Name: ${businessName}\nDescription: ${description || 'Not provided'}\nIndustry: ${industry || 'Not specified'}\nTarget Audience: ${audience || 'Not specified'}`,
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

    const brandDNA: BrandDNA = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ brandDNA });
  } catch (error) {
    console.error('Brainstorm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateDemoBrainstorm(name: string, description: string, industry: string, audience: string): BrandDNA {
  return {
    voice: `${name} speaks with a blend of expertise and warmth — authoritative enough to be trusted, friendly enough to be approachable${industry ? ` in the ${industry} space` : ''}`,
    tone: 'Enthusiastic, knowledgeable, and empowering — making complex topics accessible and actionable',
    values: [
      'Authenticity in everything we share',
      'Innovation that serves real needs',
      'Community-driven growth',
      'Excellence without pretension',
    ],
    targetAudience: audience || `${industry ? `${industry} professionals and enthusiasts` : 'Forward-thinking professionals'} aged 25-45 who value quality, seek growth, and engage actively on social media`,
    keywords: [
      name.toLowerCase(),
      industry?.toLowerCase() || 'innovation',
      'growth',
      'community',
      'expertise',
      'results',
    ].filter(Boolean),
    personality: `Think of ${name} as the brilliant friend everyone wants at their dinner party — ${description ? `known for ${description.toLowerCase()}, ` : ''}always has the best insights, shares generously, and makes everyone feel like they belong`,
    uniqueSellingPoints: [
      `${name}'s distinctive approach that combines ${industry || 'industry'} expertise with genuine human connection`,
      'Content that educates and inspires simultaneously',
      'A community-first philosophy that turns followers into advocates',
    ],
    contentThemes: [
      `${industry || 'Industry'} trends and hot takes`,
      'Behind-the-scenes and process reveals',
      'Quick tips and actionable advice',
      'Customer/community spotlights',
      'Myth-busting and contrarian insights',
    ],
  };
}
