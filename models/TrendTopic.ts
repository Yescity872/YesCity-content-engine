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
