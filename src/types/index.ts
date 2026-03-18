export interface BrandDNA {
  voice: string;
  tone: string;
  values: string[];
  targetAudience: string;
  keywords: string[];
  personality: string;
  uniqueSellingPoints: string[];
  contentThemes: string[];
  sourceUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'tiktok';

export interface PlatformChat {
  platform: Platform;
  messages: ChatMessage[];
}

export interface Business {
  id: string;
  name: string;
  description: string;
  logo?: string;
  brandDNA: BrandDNA | null;
  chats: Record<Platform, ChatMessage[]>;
  createdAt: number;
}

export const PLATFORMS: { id: Platform; label: string; color: string; icon: string; maxLength?: number; description: string }[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    icon: '📸',
    maxLength: 2200,
    description: 'Visual-first content with engaging captions, hashtags, and calls-to-action',
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    color: '#000000',
    icon: '𝕏',
    maxLength: 280,
    description: 'Concise, punchy posts with trending hooks and viral potential',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: '💼',
    maxLength: 3000,
    description: 'Professional thought leadership with industry insights and credibility',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    color: '#00F2EA',
    icon: '🎵',
    maxLength: 4000,
    description: 'Trend-driven scripts with hooks, transitions, and viral formats',
  },
];

export type ContentFormat = 'post' | 'story' | 'reel' | 'thread' | 'carousel' | 'script' | 'article';

export const CONTENT_FORMATS: { id: ContentFormat; label: string; platforms: Platform[] }[] = [
  { id: 'post', label: 'Post', platforms: ['instagram', 'twitter', 'linkedin', 'tiktok'] },
  { id: 'story', label: 'Story / Ephemeral', platforms: ['instagram', 'tiktok'] },
  { id: 'reel', label: 'Reel / Short Video', platforms: ['instagram', 'tiktok'] },
  { id: 'thread', label: 'Thread', platforms: ['twitter', 'linkedin'] },
  { id: 'carousel', label: 'Carousel', platforms: ['instagram', 'linkedin'] },
  { id: 'script', label: 'Video Script', platforms: ['tiktok', 'instagram'] },
  { id: 'article', label: 'Article / Long-form', platforms: ['linkedin'] },
];

export const TONE_OPTIONS = [
  'Professional', 'Casual', 'Witty', 'Inspirational', 'Educational',
  'Bold', 'Empathetic', 'Urgent', 'Playful', 'Authoritative',
] as const;

export const BRIEF_TEMPLATES: { label: string; topic: string; format: ContentFormat; tone: string }[] = [
  { label: 'Product Launch', topic: 'Announce a new product or feature launch', format: 'post', tone: 'Bold' },
  { label: 'Behind the Scenes', topic: 'Show the behind-the-scenes process of our work', format: 'reel', tone: 'Casual' },
  { label: 'Industry Insight', topic: 'Share a key insight or trend in our industry', format: 'thread', tone: 'Authoritative' },
  { label: 'Customer Story', topic: 'Highlight a customer success story or testimonial', format: 'post', tone: 'Inspirational' },
  { label: 'How-To Guide', topic: 'Create a step-by-step tutorial related to our niche', format: 'carousel', tone: 'Educational' },
  { label: 'Trending Topic', topic: 'Put our brand spin on a current trend or viral moment', format: 'reel', tone: 'Witty' },
];

export interface ContentBrief {
  topic: string;
  format: ContentFormat;
  platforms: Platform[];
  tone: string;
}

export const DEFAULT_BRAND_DNA: BrandDNA = {
  voice: '',
  tone: '',
  values: [],
  targetAudience: '',
  keywords: [],
  personality: '',
  uniqueSellingPoints: [],
  contentThemes: [],
};
