import mongoose, { Schema, Document, models, model } from "mongoose";

// ─── Sub-document schema for each day's plan item ────────────────────────────

const weeklyPlanItemSchema = new Schema(
  {
    day: { type: String, required: true },
    date: { type: String },
    platform: { type: String, required: true },
    contentType: { type: String, required: true },
    topic: { type: String, required: true },
    contentIdea: { type: String, required: true },
    captionDirection: { type: String, required: true },
    cta: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "approved", "in-progress", "posted"],
      default: "draft",
    },
  },
  { _id: false }
);

// ─── Main WeeklyPlan schema ───────────────────────────────────────────────────

export interface IWeeklyPlanItem {
  day: string;
  date?: string;
  platform: string;
  contentType: string;
  topic: string;
  contentIdea: string;
  captionDirection: string;
  cta: string;
  status: "draft" | "approved" | "in-progress" | "posted";
}

export interface IWeeklyPlan extends Document {
  weekStartDate: Date;
  weekEndDate: Date;
  generatedFor?: string;
  context?: string;
  items: IWeeklyPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

const weeklyPlanSchema = new Schema<IWeeklyPlan>(
  {
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    generatedFor: { type: String, default: "YesCity" },
    context: { type: String },
    items: { type: [weeklyPlanItemSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "weekly_plans",
  }
);

// Prevent model re-compilation during Next.js hot-reload
const WeeklyPlan =
  (models.WeeklyPlan as mongoose.Model<IWeeklyPlan>) ||
  model<IWeeklyPlan>("WeeklyPlan", weeklyPlanSchema);

export default WeeklyPlan;
