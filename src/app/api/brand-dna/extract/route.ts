import { NextRequest, NextResponse } from 'next/server';
import { BrandDNA } from '@/types';

interface PageData {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  headings: string[];
  bodyText: string;
  url: string;
}

function extractPageData(html: string, url: string): PageData {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || '';

  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);
  const metaDescription = metaDescMatch?.[1]?.trim() || '';

  // Extract OG tags
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:title["'][^>]*>/i);
  const ogTitle = ogTitleMatch?.[1]?.trim() || '';

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:description["'][^>]*>/i);
  const ogDescription = ogDescMatch?.[1]?.trim() || '';

  // Extract all headings (h1-h3)
  const headingMatches = html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi);
  const headings: string[] = [];
  for (const match of headingMatches) {
    const text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text && text.length > 2 && text.length < 200) {
      headings.push(text);
    }
  }

  // Extract body text (strip scripts, styles, nav, footer, then tags)
  const bodyText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { title, metaDescription, ogTitle, ogDescription, headings: headings.slice(0, 20), bodyText, url };
}

function buildPageSummary(data: PageData): string {
  const parts: string[] = [];

  parts.push(`URL: ${data.url}`);
  if (data.title) parts.push(`Page Title: ${data.title}`);
  if (data.metaDescription) parts.push(`Meta Description: ${data.metaDescription}`);
  if (data.ogTitle && data.ogTitle !== data.title) parts.push(`OG Title: ${data.ogTitle}`);
  if (data.ogDescription && data.ogDescription !== data.metaDescription) parts.push(`OG Description: ${data.ogDescription}`);
  if (data.headings.length > 0) parts.push(`Key Headings:\n${data.headings.map(h => `  - ${h}`).join('\n')}`);
  if (data.bodyText) parts.push(`Page Content (excerpt):\n${data.bodyText.slice(0, 6000)}`);

  return parts.join('\n\n');
}

async function fetchPageContent(url: string): Promise<PageData> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  return extractPageData(html, url);
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Please enter a valid URL (e.g., https://example.com)' }, { status: 400 });
    }

    // Fetch the webpage
    let pageData: PageData;
    try {
      pageData = await fetchPageContent(parsedUrl.toString());
    } catch {
      return NextResponse.json({ error: 'Could not fetch the website. Make sure the URL is correct and publicly accessible.' }, { status: 400 });
    }

    const pageSummary = buildPageSummary(pageData);

    // Check if we got meaningful content
    const hasContent = pageData.title || pageData.metaDescription || pageData.headings.length > 0 || pageData.bodyText.length > 100;
    if (!hasContent) {
      return NextResponse.json({
        error: 'Could not extract meaningful content from this URL. The site may require JavaScript to render. Try the AI Brainstorm option instead.',
      }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Demo mode: build brand DNA from the actual scraped content
      return NextResponse.json({
        brandDNA: buildDNAFromPageData(pageData),
      });
    }

    // AI-powered extraction
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
        system: `You are an expert brand strategist who extracts Brand DNA from websites. Analyze the provided webpage content carefully — every field you return must be specifically derived from what you see on THIS website, not generic filler.

Return ONLY valid JSON with this exact structure:
{
  "voice": "Describe the specific brand voice based on their actual writing style and language",
  "tone": "Describe the specific tone they use based on their actual content",
  "values": ["Extract 3-5 actual values the brand communicates"],
  "targetAudience": "Describe who this brand is specifically targeting based on their content, products, and messaging",
  "keywords": ["Extract 5-8 actual keywords/phrases that define this brand from their content"],
  "personality": "Describe the brand's specific personality as demonstrated on their site",
  "uniqueSellingPoints": ["Extract 2-4 specific things this brand highlights as differentiators"],
  "contentThemes": ["Identify 3-5 content themes this brand focuses on based on their headings and content"]
}

CRITICAL: Be specific to THIS brand. Reference their actual products, services, language, and messaging. Do NOT return generic marketing speak.`,
        messages: [
          {
            role: 'user',
            content: `Extract the Brand DNA from this website:\n\n${pageSummary}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI analysis failed. Try again or use AI Brainstorm instead.' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse brand DNA from AI response' }, { status: 500 });
    }

    const brandDNA: BrandDNA = { ...JSON.parse(jsonMatch[0]), sourceUrl: url };
    return NextResponse.json({ brandDNA });
  } catch (error) {
    console.error('Extract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Demo mode: builds Brand DNA directly from the scraped page data
 * instead of returning generic filler.
 */
function buildDNAFromPageData(data: PageData): BrandDNA {
  const domain = new URL(data.url).hostname.replace('www.', '');
  const brandName = data.title?.split(/[|\-–—]/)[0]?.trim() || domain.split('.')[0];

  // Extract keywords from headings and meta
  const allText = [data.title, data.metaDescription, data.ogDescription, ...data.headings].join(' ').toLowerCase();
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'we', 'you', 'they', 'he', 'she', 'my', 'our', 'your', 'their', 'his', 'her', 'from', 'up', 'about', 'into', 'over', 'after', 'not', 'no', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'until', 'while', 'if', 'then', 'else', 'when', 'how', 'what', 'which', 'who', 'whom', 'where', 'why', 'how', 'get', 'got', 'also', 'new', 'one', 'two', '']);
  const words = allText.replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !commonWords.has(w));
  const wordFreq = new Map<string, number>();
  words.forEach(w => wordFreq.set(w, (wordFreq.get(w) || 0) + 1));
  const topKeywords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  // Use headings as content themes
  const contentThemes = data.headings
    .filter(h => h.length > 5 && h.length < 80)
    .slice(0, 5);

  return {
    voice: data.metaDescription
      ? `Based on their messaging: "${data.metaDescription.slice(0, 120)}${data.metaDescription.length > 120 ? '...' : ''}" — ${brandName} communicates with a direct, purpose-driven voice`
      : `${brandName} presents itself with a focused, professional voice based on their site content`,
    tone: data.ogDescription
      ? `Reflected in their own words: "${data.ogDescription.slice(0, 100)}${data.ogDescription.length > 100 ? '...' : ''}"`
      : `${brandName} uses a confident and informative tone across their site`,
    values: contentThemes.length > 0
      ? contentThemes.slice(0, 4).map(theme => `Focus on: ${theme}`)
      : [`${brandName}'s core offering`, 'Quality and reliability', 'Customer-focused approach'],
    targetAudience: data.metaDescription
      ? `Based on their site messaging ("${data.metaDescription.slice(0, 80)}..."), their target audience appears to be people interested in ${topKeywords.slice(0, 3).join(', ')}`
      : `Visitors interested in ${topKeywords.slice(0, 3).join(', ') || brandName}`,
    keywords: topKeywords.length > 0 ? topKeywords : [brandName.toLowerCase()],
    personality: `${brandName} positions itself as ${data.title ? `"${data.title}"` : `a ${domain} brand`} — ${contentThemes.length > 0 ? `focusing on topics like ${contentThemes.slice(0, 2).join(' and ')}` : 'with a clear digital presence'}`,
    uniqueSellingPoints: [
      data.metaDescription || `${brandName}'s unique offering as presented on ${domain}`,
      ...(data.headings.slice(0, 2).map(h => h)),
    ].filter(Boolean).slice(0, 3),
    contentThemes: contentThemes.length > 0
      ? contentThemes
      : [`${brandName} updates`, 'Industry insights', 'Product/service highlights'],
    sourceUrl: data.url,
  };
}
