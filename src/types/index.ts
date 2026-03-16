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

export type Platform = 'instagram' | 'youtube-shorts' | 'linkedin' | 'tiktok';

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
    id: 'youtube-shorts',
    label: 'YouTube Shorts',
    color: '#FF0000',
    icon: '🎬',
    maxLength: 100,
    description: 'Short-form vertical video scripts with hooks, retention tactics, and viral formats',
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
