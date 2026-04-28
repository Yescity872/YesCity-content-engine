import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ITrendSession extends Document {
  sessionId: string;
  weekId: string;
  batchNumber: number;
  topicIds: string[];
  createdAt: Date;
}

const trendSessionSchema = new Schema<ITrendSession>(
  {
    sessionId: { type: String, required: true, index: true },
    weekId: { type: String, required: true },
    batchNumber: { type: Number, required: true },
    topicIds: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "trend_sessions",
  }
);

// Delete existing model if it exists to apply schema changes in dev
if (models.TrendSession) {
  delete (models as any).TrendSession;
}

const TrendSession = model<ITrendSession>("TrendSession", trendSessionSchema);

export default TrendSession;
