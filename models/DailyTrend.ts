import mongoose, { Schema, Document } from "mongoose";

export interface IDailyTrend extends Document {
  dateKey: string; // YYYY-MM-DD
  country: string; // default IN
  source: "rss" | "google-trends-api" | "ai-fallback" | "cached";
  isFallback: boolean;
  trends: Array<{
    title: string;
    traffic?: string;
    relatedQueries: string[];
    relatedTopics: string[];
    articles: Array<{
      title: string;
      source: string;
      url: string;
    }>;
    interestOverTime?: any[];
    interestByRegion?: any[];
    aiExplanation?: string;
    yesCityAngle?: string;
    postIdeas?: string[];
    reelIdeas?: string[];
    fetchedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DailyTrendSchema: Schema = new Schema(
  {
    dateKey: { type: String, required: true },
    country: { type: String, default: "IN" },
    source: { type: String, required: true },
    isFallback: { type: Boolean, default: false },
    trends: [
      {
        title: { type: String, required: true },
        traffic: String,
        relatedQueries: [String],
        relatedTopics: [String],
        articles: [
          {
            title: String,
            source: String,
            url: String,
          },
        ],
        interestOverTime: Schema.Types.Mixed,
        interestByRegion: Schema.Types.Mixed,
        aiExplanation: String,
        yesCityAngle: String,
        postIdeas: [String],
        reelIdeas: [String],
        fetchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { 
    timestamps: true 
  }
);

DailyTrendSchema.index({ dateKey: 1, country: 1 }, { unique: true });

export default mongoose.models.DailyTrend || mongoose.model<IDailyTrend>("DailyTrend", DailyTrendSchema);
