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
  // Temporarily disabling cache lookup to ensure fresh high-quality prompts
  // const cached = await IdeaCache.findOne({ key: cacheKey });
  // if (cached) return cached.data;

  console.log(`[QuickIdea] Generating detailed ideas for: ${input.topic}`);

  const systemPrompt = `You are the Lead Creative Director for YesCity. 
  Your goal is to provide a COMPLETE production roadmap. 
  - YOU MUST GENERATE EXACTLY 5 POST IDEAS AND EXACTLY 5 REEL IDEAS. 
  - DO NOT return fewer than 5 ideas for each category.
  
  CRITICAL RULES FOR EXECUTION STEPS & SCENE BREAKDOWNS:
  - DO NOT tell the user to 'Research', 'Find', 'Plan', or 'Prepare'. 
  - YOU must provide the research. If the topic is 'Best cafes', you MUST NAME 3 real or highly probable cafes. 
  - Every step must be an ACTION. (e.g., 'Go to [Location Name]', 'Photograph the [Specific Object]', 'Take a static shot of [Item]').
  - For POSTS: Use words like 'Photograph', 'Capture static shot', 'Create graphic'.
  - For REELS: Use words like 'Film', 'Record', 'Camera movement'.
  - If you don't have real-time data for a niche, use your internal knowledge to suggest the most ICONIC or LIKELY spots/actions.
  - The user should be able to start filming/shooting immediately without opening Google.

  EACH POST IDEA MUST INCLUDE:
  - title
  - concept
  - hook
  - caption
  - CTA
  - hashtags
  - executionSteps (Min 3 CONCRETE, DATA-RICH steps focused on PHOTOGRAPHY and STATIC shots. NAME locations/items)
  - difficulty
  - estimatedTime
  - aiPrompt (A 100-word professional high-resolution PHOTOGRAPHIC prompt. Mention 'Photorealistic', '8k', '35mm lens', 'Studio lighting'. MUST BE A STATIC IMAGE PROMPT, NOT A VIDEO.)

  EACH REEL IDEA MUST INCLUDE:
  - title
  - concept
  - hook
  - sceneBreakdown (Min 3 timestamped scenes)
  - caption
  - CTA
  - hashtags
  - editingStyle
  - difficulty
  - estimatedTime
  - aiPrompt (A 100-word professional VIDEO prompt with camera movement instructions e.g. FPV drone, cinematic lighting, and exact motion details.)

  Return JSON structure:
  {
    "postIdeas": [
      { "title": "...", "concept": "...", "aiPrompt": "Photographic static image prompt here...", ... }
    ],
    "reelIdeas": [
      { "title": "...", "concept": "...", "aiPrompt": "Professional Video prompt here...", ... }
    ],
    "recommendedPlatforms": ["platform1", "platform2"],
    "contentCalendarSuggestion": "..."
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
      inputForCache: input,
      forceRefresh: true
    });

    await IdeaCache.create({ key: cacheKey, data: result });
    return result;
  } catch (err) {
    console.error("[QuickIdea] Error:", err);
    return null;
  }
}
