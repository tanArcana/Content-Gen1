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

export type ContentType = 'post' | 'story' | 'thread' | 'reel-script' | 'carousel';

export const CONTENT_TYPES: { id: ContentType; label: string; description: string }[] = [
  { id: 'post', label: 'Post', description: 'Standard feed post with caption' },
  { id: 'story', label: 'Story', description: 'Short-form ephemeral content' },
  { id: 'thread', label: 'Thread', description: 'Multi-part connected posts' },
  { id: 'reel-script', label: 'Reel / Video Script', description: 'Script for short-form video' },
  { id: 'carousel', label: 'Carousel', description: 'Multi-slide visual content' },
];

export interface ContentPiece {
  id: string;
  businessId: string;
  contentType: ContentType;
  topic: string;
  platforms: Platform[];
  generatedContent: Record<Platform, string>;
  status: 'draft' | 'generating' | 'ready';
  createdAt: number;
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
