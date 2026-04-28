import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ITrendReference extends Document {
  topicId: string;
  platform: string;
  url: string;
  mediaType: "reel" | "post";
  thumbnailUrl?: string;
  aiCaption: string;
  sourceType: "live" | "curated" | "demo";
  scrapedAt: Date;
}

const trendReferenceSchema = new Schema<ITrendReference>(
  {
    topicId: { type: String, required: true, index: true },
    platform: { type: String, default: "instagram" },
    url: { type: String, required: true, unique: true },
    mediaType: { type: String, required: true, enum: ["reel", "post"] },
    thumbnailUrl: { type: String },
    aiCaption: { type: String, required: true },
    sourceType: { 
      type: String, 
      enum: ["live", "curated", "demo"], 
      default: "live" 
    },
    scrapedAt: { type: Date, default: Date.now },
  },
  {
    collection: "trend_references",
  }
);

const TrendReference =
  (models.TrendReference as mongoose.Model<ITrendReference>) ||
  model<ITrendReference>("TrendReference", trendReferenceSchema);

export default TrendReference;
