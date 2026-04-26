/**
 * services/groqService.ts
 * Groq LLM integration for AI-powered content generation.
 */

import Groq from "groq-sdk";
import type { ContentIdea, GenerateIdeasInput } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqGenerationResult {
  content: string;
  tokensUsed?: number;
}

/**
 * Generates structured content ideas using Groq llama-3.3-70b-versatile.
 */
export async function generateIdeasWithGroq(input: GenerateIdeasInput): Promise<ContentIdea[]> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const { topic, platform, tone, targetAudience } = input;

  const systemPrompt = `You are a world-class AI Content Strategist and Production Planner for "YesCity".
Your goal is to generate 5 high-converting, viral content ideas for ${platform}.
The topic is: ${topic}
The tone is: ${tone}
The target audience is: ${targetAudience}

You MUST return a JSON object with a single key "ideas" containing an array of 5 ideas. 
Each idea must follow this exact structure:
{
  "ideaTitle": "Catchy title",
  "conceptSummary": "2-3 lines explaining what the content is about",
  "whyItWorks": "Why this fits the platform and audience",
  "contentAngle": "The unique perspective (e.g. budget, hidden gem, funny POV)",
  "hook": "The opening line or visual hook",
  "caption": "Full caption with hashtags",
  "cta": "Specific call to action",
  "format": "The content format (e.g. Reel, Carousel, Post, Thread)",
  "visualStyle": "Detailed camera/edit style instructions",
  "audioMood": "Specific music or audio mood suggestion",
  "productionPrompts": [
    {
      "sceneNumber": 1,
      "whatHappens": "Human-readable explanation of what happens in the scene",
      "sourceType": "AI-generated" or "Stock footage",
      "videoPrompt": "If AI-generated, provide a highly detailed prompt for Runway/Pika. Include camera movement, lighting, and textures. Concrete details only. If Stock footage, leave empty.",
      "stockSearchKeywords": "If Stock footage, provide 3-5 keywords. If AI-generated, leave empty.",
      "duration": "e.g. 3s",
      "transition": "e.g. Fade, Match-cut",
      "textOverlay": "Text on screen"
    }
  ]
}

Important Rules:
1. Be extremely concrete. No vague terms like "iconic visual". Use "Hawa Mahal Jaipur, golden hour, cinematic wide shot".
2. Ensure the visual style and production prompts are high-fidelity and directly usable in tools.
3. Only output valid JSON.
`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate 5 viral ${platform} ideas for ${topic} aimed at ${targetAudience} with a ${tone} tone.` },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content || "";
  const parsed = JSON.parse(content);
  return parsed.ideas || [];
}

/**
 * General purpose generation with Groq.
 */
export async function generateWithGroq(
  messages: GroqMessage[]
): Promise<GroqGenerationResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const completion = await groq.chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
  });

  return {
    content: completion.choices[0].message.content || "",
    tokensUsed: completion.usage?.total_tokens,
  };
}

/**
 * improve/rewrite a caption using Groq.
 */
export async function improveCaptionWithGroq(
  caption: string,
  tone: string
): Promise<string> {
  const messages: GroqMessage[] = [
    { role: "system", content: "You are a social media copywriter. Rewrite the following caption to be more engaging." },
    { role: "user", content: `Tone: ${tone}\nCaption: ${caption}` },
  ];

  const result = await generateWithGroq(messages);
  return result.content;
}
/**
 * Analyzes a trend and generates 5 post ideas and 5 reel ideas.
 */
export async function analyzeTrendAndGenerateIdeas(trendTitle: string, captions: string[], classification: string = "indirect"): Promise<any> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const isSensitive = classification === "sensitive";

  const systemPrompt = `You are a world-class AI Trend Analyst and Travel Content Strategist for "YesCity", a brand focused on Indian city discovery and exploration.
Your goal is to analyze a GLOBAL trend from ANY domain (memes, pop culture, movies, sports, food, news, etc.) and provide strategic insights on how to adapt it for the Indian market.

Trend Title: ${trendTitle}
Trend Type: ${classification} (direct travel, indirect, or sensitive)
Scraped Captions: ${captions.slice(0, 5).join(" | ")}

### ADAPTATION STRATEGY:
1. **The YesCity Mission**: We discover Indian cities, hidden gems, local food, culture, and weekend trips.
2. **Global to Local**: Even if the trend is international (e.g., a Hollywood meme), convert it into an Indian context (e.g., using it to show Delhi street food or Jaipur heritage).
3. **Sensitive Trends**: If the classification is "sensitive" (war, tragedy, etc.), you MUST remain neutral and informational. Provide travel advisories, safety tips, or responsible awareness. Do NOT generate promotional or funny ideas.

### OUTPUT STRUCTURE:
Return a JSON object:
{
  "aiAnalysis": {
    "whatItIs": "Brief explanation of the global trend",
    "whyTrending": "Global drivers of this trend",
    "howPeopleUsing": "Common viral patterns",
    "brandSafetyNote": "Safety/sensitivity check for YesCity",
    "yesCityAngle": "Strategic plan to adapt this for Indian city discovery"
  },
  "postIdeas": [
    {
      "title": "...",
      "conceptSummary": "2-3 lines",
      "hook": "...",
      "caption": "...",
      "cta": "...",
      "sceneBreakdown": "...",
      "aiVideoPrompt": "..."
    }
  ],
  "reelIdeas": [
     {
      "title": "...",
      "conceptSummary": "2-3 lines",
      "hook": "...",
      "caption": "...",
      "cta": "...",
      "sceneBreakdown": "...",
      "aiVideoPrompt": "..."
    }
  ]
}

Ensure exactly 5 postIdeas and 5 reelIdeas.
`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze the "${trendTitle}" trend and generate 10 travel content ideas.` },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content || "";
  return JSON.parse(content);
}
