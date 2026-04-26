import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IScrapedPost extends Document {
  postUrl: string;
  caption: string;
  hashtags: string[];
  authorHandle: string;
  mediaType: "reel" | "post";
  sourceType?: "live" | "curated" | "demo";
  scrapedAt: Date;
  engagement: {
    likes: number;
    comments: number;
    views: number;
  };
}

const scrapedPostSchema = new Schema<IScrapedPost>(
  {
    postUrl: { type: String, required: true, unique: true },
    caption: { type: String, required: true },
    hashtags: { type: [String], default: [] },
    authorHandle: { type: String, required: true },
    mediaType: { type: String, required: true, enum: ["reel", "post"] },
    sourceType: { type: String, enum: ["live", "curated", "demo"], default: "live" },
    scrapedAt: { type: Date, default: Date.now },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
  },
  {
    collection: "scraped_posts",
  }
);

const ScrapedPost =
  (models.ScrapedPost as mongoose.Model<IScrapedPost>) ||
  model<IScrapedPost>("ScrapedPost", scrapedPostSchema);

export default ScrapedPost;
