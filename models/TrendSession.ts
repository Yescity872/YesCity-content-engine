import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ITrendCard {
  trendId: string;
  title: string;
  summary: string;
  hashtags: string[];
  captionSnippet: string;
  whyItMatters: string;
  yesCityAngle: string;
  classification: "direct" | "indirect" | "sensitive";
  referencePosts: any[];
  referenceReels: any[];
}

export interface ITrendSession extends Document {
  sessionId: string;
  query: string;
  trendCards: ITrendCard[];
  createdAt: Date;
}

const trendCardSchema = new Schema(
  {
    trendId: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    hashtags: { type: [String], default: [] },
    captionSnippet: { type: String, required: true },
    whyItMatters: { type: String, required: true },
    whyThisMatters: { type: String }, // Legacy compatibility
    yesCityAngle: { type: String, required: true },
    classification: { type: String, enum: ["direct", "indirect", "sensitive"], default: "indirect" },
    referencePosts: { type: Schema.Types.Mixed, default: [] },
    referenceReels: { type: Schema.Types.Mixed, default: [] },
  },
  { _id: false }
);

const trendSessionSchema = new Schema<ITrendSession>(
  {
    sessionId: { type: String, required: true, index: true },
    query: { type: String, required: true },
    trendCards: { type: [trendCardSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "trend_sessions",
  }
);

delete (models as any).TrendSession;
const TrendSession =
  model<ITrendSession>("TrendSession", trendSessionSchema);

export default TrendSession;
