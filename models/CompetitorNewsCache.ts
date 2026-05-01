import mongoose, { Schema, Document } from "mongoose";

export interface ICompetitorNewsSource {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  snippet: string;
  freshness: "recent" | "historical" | "undated";
  type: string;
}

export interface ICompetitorNewsCache extends Document {
  competitorName: string;
  normalizedCompetitor: string;
  topic: string;
  normalizedTopic: string;
  region: string;
  lookbackDays: number;
  sources: ICompetitorNewsSource[];
  sourceUsed: string;
  createdAt: Date;
  expiresAt: Date;
}

const CompetitorNewsCacheSchema: Schema = new Schema({
  competitorName: { type: String, required: true },
  normalizedCompetitor: { type: String, index: true },
  topic: { type: String },
  normalizedTopic: { type: String, index: true },
  region: { type: String, default: "IN" },
  lookbackDays: { type: Number, default: 7 },
  sources: [
    {
      title: { type: String },
      url: { type: String },
      source: { type: String },
      publishedAt: { type: String },
      snippet: { type: String },
      freshness: { type: String, enum: ["recent", "historical", "undated"] },
      type: { type: String }
    }
  ],
  sourceUsed: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true }
});

export default mongoose.models.CompetitorNewsCache ||
  mongoose.model<ICompetitorNewsCache>("CompetitorNewsCache", CompetitorNewsCacheSchema);
