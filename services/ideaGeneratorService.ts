/**
 * services/ideaGeneratorService.ts
 * Orchestrates content idea generation: Groq (AI) with rule-based fallback.
 * Upgraded for YesCity AI Trend-to-Content Engine MVP.
 */

import { aiRouter } from "./ai/aiRouter";
import type { ContentIdea, GenerateIdeasInput } from "@/types";

export async function generateIdeas(input: GenerateIdeasInput): Promise<{ ideas: ContentIdea[], source: "AI" | "Rule-based" | "fallback" }> {
  const { topic, platform, tone, targetAudience } = input;

  const systemPrompt = `You are the YesCity AI Content Strategist.
Your goal is to generate 5 high-performing, viral content ideas for ${platform}.
Target Audience: ${targetAudience}
Tone: ${tone}
Topic: ${topic}

Rules:
1. Each idea must be a complete execution package.
2. Focus on local Indian city nuances where applicable.
3. Include title, conceptSummary, whyItWorks, contentAngle, hook, caption, cta, format, visualStyle, audioMood.
4. Also include "productionPrompts" (array of 3 steps).

Return ONLY a JSON object with key "ideas".`;

  console.log(`[IdeaGenerator] Requesting ideas for: ${topic}...`);

  const response = await aiRouter.generateStructured({
    purpose: "postReelIdeas",
    systemPrompt,
    userPrompt: `Generate 5 ideas for ${topic} on ${platform} for ${targetAudience}.`,
    inputForCache: input
  });

  const ideas = (response.ideas || []).map((id: any) => ({
    ...id,
    ideaTitle: id.ideaTitle || id.title || `Idea for ${topic}`,
    referenceContent: id.referenceContent || [],
    productionPrompts: id.productionPrompts || [],
  }));

  return { 
    ideas, 
    source: response.status === "fallback" ? "Rule-based" : "AI" 
  };
}

function generateIdeasRuleBased(input: GenerateIdeasInput): ContentIdea[] {
  const { topic, platform, targetAudience } = input;

  const ideaTitles = [
    `The Ultimate ${topic} Guide for ${targetAudience}`,
    `Top 5 Hidden Gems in ${topic}`,
    `${topic} on a Budget`,
    `Why ${topic} is Trending`,
    `POV: Your First Time in ${topic}`,
  ];

  return ideaTitles.map((title) => {
    return {
      ideaTitle: title,
      conceptSummary: `A comprehensive ${platform} guide to ${topic} specifically designed for ${targetAudience}.`,
      whyItWorks: "Uses proven content hooks for travel audiences.",
      contentAngle: "Educational & Relatable",
      hook: `Did you know this about ${topic}?`,
      caption: `Discovering the best of ${topic} today! 🌍 #YesCity #${topic.replace(/\s+/g, "")}`,
      cta: `Follow @YesCity for more travel tips!`,
      format: platform === "Instagram" ? "Reel" : "Post",
      visualStyle: "Cinematic, fast-paced edits",
      audioMood: "Trending Lo-fi or Upbeat travel track",
      productionPrompts: [
        {
          sceneNumber: 1,
          whatHappens: `Iconic shot of ${topic}.`,
          sourceType: "AI-generated",
          videoPrompt: `Cinematic wide shot of ${topic} landmarks, golden hour, 4k.`,
          duration: "3s",
          transition: "Fade"
        }
      ],
      referenceContent: []
    };
  });
}
