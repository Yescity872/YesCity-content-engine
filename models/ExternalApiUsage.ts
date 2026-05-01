import mongoose, { Schema, Document } from "mongoose";

export interface IExternalApiUsage extends Document {
  provider: string;
  monthKey: string; // e.g. "2026-05"
  dayKey: string;   // e.g. "2026-05-01"
  requests: number;
  resultsFetched: number;
  estimatedCostUsd: number;
  lastRunAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExternalApiUsageSchema = new Schema<IExternalApiUsage>(
  {
    provider: { type: String, required: true },
    monthKey: { type: String, required: true },
    dayKey: { type: String, required: true },
    requests: { type: Number, default: 0 },
    resultsFetched: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
    lastRunAt: { type: Date, default: Date.now },
  },
  { 
    timestamps: true 
  }
);

// Compound index for fast lookup
ExternalApiUsageSchema.index({ provider: 1, monthKey: 1, dayKey: 1 }, { unique: true });

export default mongoose.models.ExternalApiUsage || mongoose.model<IExternalApiUsage>("ExternalApiUsage", ExternalApiUsageSchema);
