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

export type InstagramContentType = 'post' | 'story' | 'reel';

export interface InstagramContentConfig {
  id: InstagramContentType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export const INSTAGRAM_CONTENT_TYPES: InstagramContentConfig[] = [
  {
    id: 'post',
    label: 'Feed Post',
    icon: '🖼️',
    description: 'Carousel or single image posts with captions & hashtags',
    color: '#E1306C',
  },
  {
    id: 'story',
    label: 'Story',
    icon: '⏳',
    description: 'Ephemeral content with polls, stickers & interactive elements',
    color: '#F77737',
  },
  {
    id: 'reel',
    label: 'Reel',
    icon: '🎬',
    description: 'Short-form video scripts with hooks, transitions & audio',
    color: '#833AB4',
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
