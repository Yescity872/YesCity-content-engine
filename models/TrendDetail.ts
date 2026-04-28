import mongoose, { Schema, Document } from "mongoose";

export interface IContentIdea {
  title: string;
  conceptSummary: string;
  hook: string;
  caption: string;
  cta: string;
  sceneBreakdown: string[]; // Updated to array
  aiVideoPrompt: string;
}

export interface ITrendDetail extends Document {
  topicId: string;
  topicTitle: string;
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

const ContentIdeaSchema = new Schema({
  title: { type: String, required: true },
  conceptSummary: { type: String, required: true },
  hook: { type: String, required: true },
  caption: { type: String, required: true },
  cta: { type: String, required: true },
  sceneBreakdown: { type: [String], default: [] }, // Updated to array
  aiVideoPrompt: { type: String, required: true },
});

const TrendDetailSchema = new Schema({
  topicId: { type: String, required: true, unique: true },
  topicTitle: { type: String, required: true },
  aiAnalysis: {
    whatItIs: String,
    whyTrending: String,
    howPeopleUsing: String,
    brandSafetyNote: String,
    yesCityAngle: String,
  },
  postIdeas: [ContentIdeaSchema],
  reelIdeas: [ContentIdeaSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TrendDetail || mongoose.model<ITrendDetail>("TrendDetail", TrendDetailSchema);
