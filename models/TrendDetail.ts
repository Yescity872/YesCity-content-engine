import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IContentIdea {
  title: string;
  conceptSummary: string;
  hook: string;
  caption: string;
  cta: string;
  sceneBreakdown: string;
  aiVideoPrompt: string;
}

export interface ITrendDetail extends Document {
  sessionId: string;
  trendId: string;
  topic: string;
  relatedPosts: any[]; 
  relatedReels: any[]; 
  aiAnalysis: {
    whatItIs: string;
    whyTrending: string;
    howPeopleUsing: string;
    brandSafetyNote: string;
    yesCityAngle: string;
  };
  postIdeas: IContentIdea[];
  reelIdeas: IContentIdea[];
  createdAt: Date;
}

const contentIdeaSchema = new Schema(
  {
    title: { type: String, required: true },
    conceptSummary: { type: String, required: true },
    hook: { type: String, required: true },
    caption: { type: String, required: true },
    cta: { type: String, required: true },
    sceneBreakdown: { type: String, required: true },
    aiVideoPrompt: { type: String, required: true },
  },
  { _id: false }
);

const trendDetailSchema = new Schema<ITrendDetail>(
  {
    sessionId: { type: String, required: true, index: true },
    trendId: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    relatedPosts: { type: Schema.Types.Mixed, default: [] },
    relatedReels: { type: Schema.Types.Mixed, default: [] },
    aiAnalysis: {
      whatItIs: { type: String, required: true },
      whyTrending: { type: String, required: true },
      howPeopleUsing: { type: String, required: true },
      brandSafetyNote: { type: String, required: true },
      yesCityAngle: { type: String, required: true },
    },
    postIdeas: { type: [contentIdeaSchema], default: [] },
    reelIdeas: { type: [contentIdeaSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "trend_details",
  }
);

const TrendDetail =
  (models.TrendDetail as mongoose.Model<ITrendDetail>) ||
  model<ITrendDetail>("TrendDetail", trendDetailSchema);

export default TrendDetail;
