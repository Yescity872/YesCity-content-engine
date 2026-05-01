import { aiRouter } from "./ai/aiRouter";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

// Simple Schema for caching ideas
const IdeaCacheSchema = new mongoose.Schema({
  key: { type: String, unique: true, index: true },
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, expires: '7d' } // Expire in 7 days
});

const IdeaCache = mongoose.models.IdeaCache || mongoose.model("IdeaCache", IdeaCacheSchema);

export interface QuickIdeaInput {
  topic: string;
  platform: string;
  audience: string;
  tone: string;
  cityOrRegion: string;
  objective: string;
}

/**
 * Upgraded Quick Idea Generator (Phase 5).
 * Generates 10 structured production packages (5 posts + 5 reels).
 */
export async function generateQuickIdeas(input: QuickIdeaInput) {
  await connectToDatabase();
  
  const cacheKey = JSON.stringify(input);
  const cached = await IdeaCache.findOne({ key: cacheKey });
  if (cached) return cached.data;

  console.log(`[QuickIdea] Generating detailed ideas for: ${input.topic}`);

  const systemPrompt = `You are the Lead Creative Director for YesCity.
  Generate 10 highly detailed production ideas (5 Static/Carousel Posts and 5 Reels/Shorts) based on the user's input.
  
  EACH POST IDEA MUST INCLUDE:
  - title
  - concept
  - hook (The opening visual/text)
  - caption (Full social media copy)
  - CTA (Call to action)
  - hashtags
  - whyItWorks (Psychological/Marketing trigger)
  - executionSteps (Bullet points for the creator)
  - difficulty (Beginner/Intermediate/Advanced)
  - estimatedTime (e.g. 2 hours)
  - assignedRole (Who should do this: Photographer, Designer, etc)

  EACH REEL IDEA MUST INCLUDE:
  - title
  - concept
  - hook (First 3 seconds)
  - sceneBreakdown (Timestamped sequence)
  - caption
  - CTA
  - hashtags
  - editingStyle (e.g. Fast-cuts, Cinematic, ASMR)
  - whyItWorks
  - difficulty
  - estimatedTime
  - assignedRole

  Return JSON structure:
  {
    "postIdeas": [...],
    "reelIdeas": [...],
    "recommendedPlatforms": ["platform1", "platform2"],
    "contentCalendarSuggestion": "1-sentence tip on timing"
  }`;

  const userPrompt = `
    Topic: ${input.topic}
    Platform Preference: ${input.platform}
    Target Audience: ${input.audience}
    Desired Tone: ${input.tone}
    City/Region: ${input.cityOrRegion}
    Marketing Objective: ${input.objective}
  `;

  try {
    const result = await aiRouter.generateStructured({
      purpose: "quickIdeaUpgrade",
      systemPrompt,
      userPrompt,
      inputForCache: input
    });

    await IdeaCache.create({ key: cacheKey, data: result });
    return result;
  } catch (err) {
    console.error("[QuickIdea] Error:", err);
    return null;
  }
}
