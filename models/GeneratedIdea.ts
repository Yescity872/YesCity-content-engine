import mongoose, { Schema, Document, models, model } from "mongoose";

// ─── Sub-document: a single reference post ────────────────────────────────────
// FUTURE: This will be populated from the `scraped_references` collection
// via Apify scrapers. For now, `isScraped: false` marks mock data.

const referencePostSchema = new Schema(
  {
    platform: { type: String, required: true },
    description: { type: String, required: true },
    likes: { type: Number },
    views: { type: Number },
    url: { type: String, required: true },
    isScraped: { type: Boolean, default: false },
    scrapedAt: { type: String },
  },
  { _id: false }
);

const productionPromptSchema = new Schema(
  {
    sceneNumber: { type: Number, required: true },
    whatHappens: { type: String, required: true },
    sourceType: { type: String, required: true, enum: ["AI-generated", "Stock footage", "Scraped reference"] },
    videoPrompt: { type: String },
    stockSearchKeywords: { type: String },
    duration: { type: String, required: true },
    transition: { type: String, required: true },
    textOverlay: { type: String },
  },
  { _id: false }
);

// ─── Sub-document: a single content idea ─────────────────────────────────────

const contentIdeaSchema = new Schema(
  {
    ideaTitle: { type: String, required: true },
    conceptSummary: { type: String, required: true },
    whyItWorks: { type: String, required: true },
    contentAngle: { type: String, required: true },
    hook: { type: String, required: true },
    caption: { type: String, required: true },
    cta: { type: String, required: true },
    format: { type: String, required: true },
    visualStyle: { type: String, default: "" },
    audioMood: { type: String, default: "" },
    productionPrompts: { type: [productionPromptSchema], default: [] },
    referenceContent: { type: [referencePostSchema], default: [] },
  },
  { _id: false }
);

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IReferencePost {
  platform: string;
  description: string;
  likes?: number;
  views?: number;
  url: string;
  isScraped: boolean;
  scrapedAt?: string;
}

export interface IProductionPrompt {
  sceneNumber: number;
  whatHappens: string;
  sourceType: "AI-generated" | "Stock footage" | "Scraped reference";
  videoPrompt?: string;
  stockSearchKeywords?: string;
  duration: string;
  transition: string;
  textOverlay?: string;
}

export interface IContentIdea {
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
  productionPrompts: IProductionPrompt[];
  referenceContent: IReferencePost[];
}

export interface IGeneratedIdea extends Document {
  inputTopic: string;
  platform: string;
  tone: string;
  targetAudience: string;
  ideas: IContentIdea[];
  generationSource: "AI" | "Rule-based";
  createdAt: Date;
  updatedAt: Date;
}

// ─── Main schema ──────────────────────────────────────────────────────────────

const generatedIdeaSchema = new Schema<IGeneratedIdea>(
  {
    inputTopic: { type: String, required: true },
    platform: { type: String, required: true },
    tone: { type: String, required: true },
    targetAudience: { type: String, required: true },
    ideas: { type: [contentIdeaSchema], default: [] },
    generationSource: { type: String, required: true, enum: ["AI", "Rule-based"] },
  },
  {
    timestamps: true,
    collection: "generated_ideas",
  }
);

// Prevent model re-compilation during Next.js hot-reload
const GeneratedIdea =
  (models.GeneratedIdea as mongoose.Model<IGeneratedIdea>) ||
  model<IGeneratedIdea>("GeneratedIdea", generatedIdeaSchema);

export default GeneratedIdea;
