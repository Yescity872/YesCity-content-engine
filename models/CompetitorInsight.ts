import mongoose, { Schema, Document } from "mongoose";

export interface ICompetitorInsight extends Document {
  competitorName: string;
  region: string;
  whatTheyAreDoingNow: string;
  attractionSecret: string;
  liveTacticalMove: string;
  latestCampaign: string;
  proofLinks: { title: string; url: string; source: string }[];
  publicSignals: { title: string; url: string; source: string; publishedAt: string | null; snippet: string; freshness: string; type: string }[];
  isAIInferred: boolean;
  updatedAt: Date;
}

const CompetitorInsightSchema: Schema = new Schema({
  competitorName: { type: String, required: true },
  region: { type: String, required: true },
  whatTheyAreDoingNow: { type: String },
  attractionSecret: { type: String },
  liveTacticalMove: { type: String },
  latestCampaign: { type: String },
  proofLinks: [
    {
      title: { type: String },
      url: { type: String },
      source: { type: String },
    },
  ],
  publicSignals: [
    {
      title: { type: String },
      url: { type: String },
      source: { type: String },
      publishedAt: { type: String },
      snippet: { type: String },
      freshness: { type: String },
      type: { type: String }
    }
  ],
  isAIInferred: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for unique competitor per region
CompetitorInsightSchema.index({ competitorName: 1, region: 1 }, { unique: true });

export default mongoose.models.CompetitorInsight ||
  mongoose.model<ICompetitorInsight>("CompetitorInsight", CompetitorInsightSchema);
