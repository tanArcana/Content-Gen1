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
  sourceUrls?: string[];
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

// Content format types
export type ContentFormat = 'post' | 'story' | 'reel' | 'carousel' | 'thread';

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

// A content brief (input to generation)
export interface ContentBrief {
  id: string;
  businessId: string;
  topic: string;
  contentFormat: ContentFormat;
  targetPlatforms: Platform[];
  toneOverride?: string;
  templateId?: string;
  campaignId?: string;
  additionalContext?: string;
  createdAt: number;
}

// A single generated content piece for one platform
export interface ContentVariant {
  id: string;
  briefId: string;
  businessId: string;
  platform: Platform;
  contentFormat: ContentFormat;
  content: string;
  hashtags: string[];
  caption?: string;
  slides?: string[];
  threadParts?: string[];
  mediaPrompt?: string;
  characterCount: number;
  status: ContentStatus;
  scheduledFor?: number;
  tags: string[];
  starred: boolean;
  createdAt: number;
  updatedAt: number;
}

// Campaign grouping
export interface Campaign {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  color: string;
  createdAt: number;
}

// Calendar event
export interface CalendarEvent {
  id: string;
  contentVariantId: string;
  businessId: string;
  platform: Platform;
  scheduledFor: number;
  status: ContentStatus;
  campaignId?: string;
}

// Legacy type kept for migration
export interface SavedContent {
  id: string;
  businessId: string;
  platform: Platform;
  content: string;
  prompt: string;
  starred: boolean;
  tags: string[];
  createdAt: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  platform: Platform | 'all';
  isBuiltIn: boolean;
  category: string;
}

export type ViewType = 'dashboard' | 'create' | 'calendar' | 'library' | 'brand-dna' | 'templates' | 'settings';

export interface AppSettings {
  apiKeyConfigured: boolean;
  defaultPlatform: Platform;
  autoSaveContent: boolean;
  defaultContentFormat?: ContentFormat;
  defaultTargetPlatforms?: Platform[];
}

export const CONTENT_FORMATS: { id: ContentFormat; label: string; icon: string; description: string }[] = [
  { id: 'post', label: 'Post', icon: '📝', description: 'Standard caption or text post' },
  { id: 'story', label: 'Story', icon: '📱', description: 'Vertical story with text overlays' },
  { id: 'reel', label: 'Reel / Short', icon: '🎬', description: 'Short-form video script' },
  { id: 'carousel', label: 'Carousel', icon: '🎠', description: 'Multi-slide swipeable content' },
  { id: 'thread', label: 'Thread', icon: '🧵', description: 'Multi-part connected posts' },
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

export const BUILT_IN_TEMPLATES: PromptTemplate[] = [
  // Instagram
  { id: 'ig-product-launch', name: 'Product Launch', prompt: 'Create an Instagram post announcing our new product/feature. Include a captivating hook, key benefits, and a CTA to learn more.', platform: 'instagram', isBuiltIn: true, category: 'Launch' },
  { id: 'ig-behind-scenes', name: 'Behind the Scenes', prompt: 'Create an authentic behind-the-scenes Instagram post showing our team/process. Make it relatable and humanize the brand.', platform: 'instagram', isBuiltIn: true, category: 'Engagement' },
  { id: 'ig-carousel-tips', name: 'Tips Carousel', prompt: 'Create a 5-slide carousel post with actionable tips related to our industry. Include a hook slide, 3 tip slides, and a CTA slide.', platform: 'instagram', isBuiltIn: true, category: 'Educational' },
  // Twitter
  { id: 'tw-hot-take', name: 'Hot Take', prompt: 'Write a provocative but thoughtful hot take tweet about a current trend in our industry. Make it conversation-starting.', platform: 'twitter', isBuiltIn: true, category: 'Engagement' },
  { id: 'tw-thread', name: 'Value Thread', prompt: 'Create a 5-tweet thread sharing valuable insights about our expertise area. Start with a hook tweet that makes people want to read the whole thread.', platform: 'twitter', isBuiltIn: true, category: 'Educational' },
  { id: 'tw-announcement', name: 'Announcement', prompt: 'Write a tweet announcing something exciting about our business. Keep it punchy and shareable with a clear CTA.', platform: 'twitter', isBuiltIn: true, category: 'Launch' },
  // LinkedIn
  { id: 'li-thought-leadership', name: 'Thought Leadership', prompt: 'Write a LinkedIn post sharing a contrarian or unique perspective on our industry. Use personal storytelling and end with a discussion question.', platform: 'linkedin', isBuiltIn: true, category: 'Thought Leadership' },
  { id: 'li-case-study', name: 'Case Study', prompt: 'Create a LinkedIn post sharing a success story or case study. Focus on the challenge, solution, and measurable results.', platform: 'linkedin', isBuiltIn: true, category: 'Social Proof' },
  { id: 'li-hiring', name: 'We\'re Hiring', prompt: 'Write a compelling LinkedIn hiring post that showcases our culture and the exciting opportunity. Make it feel authentic, not corporate.', platform: 'linkedin', isBuiltIn: true, category: 'Recruitment' },
  // TikTok
  { id: 'tt-tutorial', name: 'Quick Tutorial', prompt: 'Create a TikTok script for a quick 30-second tutorial related to our product/service. Include hook, steps, and CTA.', platform: 'tiktok', isBuiltIn: true, category: 'Educational' },
  { id: 'tt-trend', name: 'Trend Remix', prompt: 'Create a TikTok script that remixes a current trending format/sound to fit our brand message. Keep it fun and authentic.', platform: 'tiktok', isBuiltIn: true, category: 'Trending' },
  { id: 'tt-story', name: 'Story Time', prompt: 'Write a TikTok storytime script sharing an interesting story about our brand/industry. Use the "you won\'t believe what happened" format.', platform: 'tiktok', isBuiltIn: true, category: 'Engagement' },
  // Cross-platform
  { id: 'all-repurpose', name: 'Repurpose Content', prompt: 'Take this idea and create content versions for all 4 platforms: a tweet, Instagram caption, LinkedIn post, and TikTok script concept.', platform: 'all', isBuiltIn: true, category: 'Multi-Platform' },
  { id: 'all-weekly-series', name: 'Weekly Series', prompt: 'Create a recurring weekly content series concept. Include the series name, format, and this week\'s episode content.', platform: 'all', isBuiltIn: true, category: 'Series' },
];
