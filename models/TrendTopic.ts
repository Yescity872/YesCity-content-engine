import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ITrendTopic extends Document {
  topicId: string;
  title: string;
  category: string;
  contextSummary: string;
  keywords: string[];
  hashtags: string[];
  weekId: string;
  status: "pending" | "scraping" | "ready" | "failed";
  batchNumber: number;
  sourceSignals: string[];
  classification: "direct" | "adaptable" | "sensitive";
  yesCityAngle: string;
  intelligenceReport?: {
    trendPatterns: string;
    reelSimulation: string;
    executionPlans: {
      type: "post" | "reel";
      title: string;
      concept: string;
      hook: string;
      sceneBreakdown: string[];
      whatToShoot: string;
      editingStyle: string;
      caption: string;
      cta: string;
      hashtags: string[];
      difficulty: "Easy" | "Medium" | "Hard";
      time: string;
      team: string;
    }[];
    suggestedHashtags: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const trendTopicSchema = new Schema<ITrendTopic>(
  {
    topicId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    contextSummary: { type: String, required: true },
    keywords: { type: [String], default: [] },
    hashtags: { type: [String], default: [] },
    weekId: { type: String, required: true, index: true },
    status: { 
      type: String, 
      enum: ["pending", "scraping", "ready", "failed"], 
      default: "pending" 
    },
    batchNumber: { type: Number, required: true },
    sourceSignals: { type: [String], default: [] },
    classification: { 
      type: String, 
      enum: ["direct", "adaptable", "sensitive"], 
      default: "adaptable" 
    },
    yesCityAngle: { type: String, required: true },
    intelligenceReport: {
      trendPatterns: { type: String },
      reelSimulation: { type: String },
      executionPlans: [{
        type: { type: String, enum: ["post", "reel"] },
        title: { type: String },
        concept: { type: String },
        hook: { type: String },
        sceneBreakdown: { type: [String] },
        whatToShoot: { type: String },
        editingStyle: { type: String },
        caption: { type: String },
        cta: { type: String },
        hashtags: { type: [String] },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
        time: { type: String },
        team: { type: String },
      }],
      suggestedHashtags: { type: [String] },
    },
  },
  {
    collection: "trend_topics",
    timestamps: true,
  }
);

const TrendTopic =
  (models.TrendTopic as mongoose.Model<ITrendTopic>) ||
  model<ITrendTopic>("TrendTopic", trendTopicSchema);

export default TrendTopic;
