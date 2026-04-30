import mongoose, { Schema, Document } from "mongoose";

export interface IAIResponseCache extends Document {
  cacheKey: string;
  purpose: string;
  inputHash: string;
  output: any;
  provider: "groq" | "sarvam" | "template";
  aiModel?: string;
  createdAt: Date;
  expiresAt: Date;
}

const AIResponseCacheSchema: Schema = new Schema({
  cacheKey: { type: String, required: true, unique: true, index: true },
  purpose: { type: String, required: true, index: true },
  inputHash: { type: String, required: true },
  output: { type: Schema.Types.Mixed, required: true },
  provider: { type: String, enum: ["groq", "sarvam", "template"], required: true },
  aiModel: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL Index
});

export default mongoose.models.AIResponseCache || mongoose.model<IAIResponseCache>("AIResponseCache", AIResponseCacheSchema);
