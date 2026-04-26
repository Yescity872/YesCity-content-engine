// Shared TypeScript types for the YesCity Content Engine

// ─── Trend Engine ─────────────────────────────────────────────────────────────

export interface IReferenceItem {
  url: string;
  caption: string;
  mediaType: "post" | "reel";
  sourceType: "live" | "curated" | "demo";
  engagement?: string;
}

export interface ITrendCard {
  trendId: string;
  title: string;
  summary: string;
  hashtags: string[];
  captionSnippet: string;
  whyItMatters: string;
  yesCityAngle: string;
  classification: "direct" | "indirect" | "sensitive";
  referencePosts: IReferenceItem[];
  referenceReels: IReferenceItem[];
}

export interface ITrendSession {
  sessionId: string;
  query: string;
  trendCards: ITrendCard[];
  createdAt: string | Date;
}

export interface IContentIdea {
  title: string;
  conceptSummary: string;
  hook: string;
  caption: string;
  cta: string;
  sceneBreakdown: string;
  aiVideoPrompt: string;
}

export interface ITrendDetail {
  sessionId: string;
  trendId: string;
  topic: string;
  relatedPosts: string[];
  relatedReels: string[];
  aiAnalysis: {
    whatItIs: string;
    whyTrending: string;
    howPeopleUsing: string;
    brandSafetyNote: string;
    yesCityAngle: string;
  };
  postIdeas: IContentIdea[];
  reelIdeas: IContentIdea[];
  createdAt: string | Date;
}

// ─── Idea Generator ───────────────────────────────────────────────────────────

export interface ReferencePost {
  platform: string;
  description: string;
  likes?: number;
  views?: number;
  url: string;
  isScraped: boolean;
  scrapedAt?: string;
}

export type SceneSourceType = "AI-generated" | "Stock footage" | "Scraped reference";

export interface ProductionPrompt {
  sceneNumber: number;
  whatHappens: string;
  sourceType: SceneSourceType;
  videoPrompt?: string;
  stockSearchKeywords?: string;
  duration: string;
  transition: string;
  textOverlay?: string;
}

export interface ContentIdea {
  ideaTitle: string;
  conceptSummary: string;
  whyItWorks: string;
  contentAngle: string;
  hook: string;
  caption: string;
  cta: string;
  format: string;
  visualStyle: string;
  audioMood: string;
  productionPrompts: ProductionPrompt[];
  referenceContent: ReferencePost[];
}

export interface GeneratedIdea {
  _id?: string;
  inputTopic: string;
  platform: string;
  tone: string;
  targetAudience: string;
  ideas: ContentIdea[];
  generationSource: "AI" | "Rule-based";
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface GenerateIdeasInput {
  topic: string;
  platform: string;
  tone: string;
  targetAudience: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
