import mongoose, { Schema, Document } from "mongoose";

export interface ITopicExpansion extends Document {
  topic: string;
  normalizedTopic: string;
  category: string;
  region: string;
  data: {
    instagramHashtags: string[];
    youtubeQueries: string[];
    googleTrendQueries: string[];
    newsQueries: string[];
    xQueries: string[];
    linkedinQueries: string[];
    competitorKeywords: string[];
    localAngles: string[];
    contentFormats: string[];
  };
  source: "groq" | "cache";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TopicExpansionSchema: Schema = new Schema(
  {
    topic: { type: String, required: true },
    normalizedTopic: { type: String, required: true },
    category: { type: String, required: true },
    region: { type: String, required: true },
    data: {
      instagramHashtags: [String],
      youtubeQueries: [String],
      googleTrendQueries: [String],
      newsQueries: [String],
      xQueries: [String],
      linkedinQueries: [String],
      competitorKeywords: [String],
      localAngles: [String],
      contentFormats: [String],
    },
    source: { type: String, enum: ["groq", "cache"], default: "groq" },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

TopicExpansionSchema.index({ normalizedTopic: 1, region: 1, category: 1 });

export default mongoose.models.TopicExpansion || mongoose.model<ITopicExpansion>("TopicExpansion", TopicExpansionSchema);
