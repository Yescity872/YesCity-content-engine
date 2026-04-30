import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ITrendReference extends Document {
  topicId: string;
  topic?: string;
  platform: "youtube" | "instagram" | "web";
  sourceName: string;
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  mediaType: "video" | "short" | "reel" | "post" | "article";
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  sourceType: "live" | "demo";
  relevanceScore?: number;
  aiMarketingNote: string;
  publishedAt?: Date;
  fetchedAt: Date;
  expiresAt: Date;
}

const trendReferenceSchema = new Schema<ITrendReference>(
  {
    topicId: { type: String, required: true, index: true },
    topic: { type: String },
    platform: { type: String, required: true, enum: ["youtube", "instagram", "web"] },
    sourceName: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    title: { type: String },
    description: { type: String },
    thumbnailUrl: { type: String },
    channelTitle: { type: String },
    mediaType: { 
      type: String, 
      required: true, 
      enum: ["video", "short", "reel", "post", "article"] 
    },
    engagement: {
      views: { type: Number },
      likes: { type: Number },
      comments: { type: Number }
    },
    sourceType: { 
      type: String, 
      enum: ["live", "demo"], 
      default: "live" 
    },
    relevanceScore: { type: Number, default: 0 },
    aiMarketingNote: { type: String, required: true },
    publishedAt: { type: Date },
    fetchedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL Index
  },
  {
    collection: "trend_references",
    timestamps: true
  }
);

const TrendReference =
  (models.TrendReference as mongoose.Model<ITrendReference>) ||
  model<ITrendReference>("TrendReference", trendReferenceSchema);

export default TrendReference;
