/**
 * services/ideaGeneratorService.ts
 * Orchestrates content idea generation: Groq (AI) with rule-based fallback.
 * Upgraded for YesCity AI Trend-to-Content Engine MVP.
 */

import { generateIdeasWithGroq } from "./groqService";
import type { ContentIdea, GenerateIdeasInput } from "@/types";

export async function generateIdeas(input: GenerateIdeasInput): Promise<{ ideas: ContentIdea[], source: "AI" | "Rule-based" }> {
  const { topic } = input;

  // 1. Try Groq (AI) first
  if (process.env.GROQ_API_KEY) {
    try {
      const ideas = await generateIdeasWithGroq(input);
      if (ideas && ideas.length > 0) {
        return { 
          ideas: ideas.map((id: any) => ({
            ...id,
            // Ensure title/ideaTitle compatibility
            ideaTitle: id.ideaTitle || id.title || `Idea for ${topic}`,
            referenceContent: id.referenceContent || [],
            productionPrompts: id.productionPrompts || [],
          })), 
          source: "AI" 
        };
      }
    } catch (error) {
      console.error("[IdeaGeneratorService] Groq failed, falling back to rule-based:", error);
    }
  }

  // 2. Rule-based Fallback
  const ideas = generateIdeasRuleBased(input);
  return { ideas, source: "Rule-based" };
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
