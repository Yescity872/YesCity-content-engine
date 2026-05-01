import { connectToDatabase } from "@/lib/mongodb";
import AIResponseCache from "@/models/AIResponseCache";
import { generateWithGroq } from "./groqClient";
import { generateWithSarvam } from "./sarvamClient";
import { getTemplateFallback } from "./templateFallback";
import crypto from "crypto";

export type AIPurpose = 
  | "dailyTrendAnalysis" 
  | "topicDiscovery"
  | "topicExpansion" 
  | "trendDetail" 
  | "fallbackIntelligence" 
  | "postReelIdeas" 
  | "platformQueries"
  | "competitorAnalysis"
  | "quickIdeaUpgrade";

interface AIRouterOptions {
  purpose: AIPurpose;
  systemPrompt: string;
  userPrompt: string;
  inputForCache: any;
  ttlHours?: number;
  forceRefresh?: boolean;
}

const TTL_CONFIG: Record<AIPurpose, number> = {
  dailyTrendAnalysis: 24,
  topicDiscovery: 168, // 7 days
  topicExpansion: 168, // 7 days
  trendDetail: 24,
  fallbackIntelligence: 24,
  postReelIdeas: 48,
  platformQueries: 168,
  competitorAnalysis: 168, // 7 days
  quickIdeaUpgrade: 48
};

/**
 * AI Router: Orchestrates Cache -> Groq -> Sarvam -> Template
 */
export const aiRouter = {
  generateStructured: async (options: AIRouterOptions) => {
    const { purpose, systemPrompt, userPrompt, inputForCache, ttlHours } = options;
    await connectToDatabase();

    // 1. Deterministic Cache Key
    const inputString = typeof inputForCache === "string" ? inputForCache : JSON.stringify(inputForCache);
    const inputHash = crypto.createHash("md5").update(inputString).digest("hex");
    const cacheKey = `${purpose}_${inputHash}`;

    // 2. Check Cache
    if (!options.forceRefresh && purpose !== "trendDetail") {
      const cached = await AIResponseCache.findOne({ cacheKey });
      if (cached) {
        console.log(`[AI Router] Cache HIT: ${cacheKey}`);
        return cached.output;
      }
    }

    console.log(`[AI Router] Cache MISS: ${cacheKey}`);

    // 3. Try Groq (Primary)
    let result = await generateWithGroq(systemPrompt, userPrompt, purpose);

    // 4. Try Sarvam (Secondary)
    if (!result) {
      console.log("[AI Router] Groq unavailable. Trying Sarvam...");
      result = await generateWithSarvam(systemPrompt, userPrompt);
    }

    // 5. Template Fallback (Safe)
    if (!result) {
      console.log("[AI Router] AI failed. Using template fallback...");
      const fallback = getTemplateFallback(purpose, inputForCache);
      return fallback;
    }

    // 6. Save Success to Cache
    try {
      const ttl = ttlHours || TTL_CONFIG[purpose] || 24;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttl);

      await AIResponseCache.create({
        cacheKey,
        purpose,
        inputHash,
        output: result.output,
        provider: result.provider,
        aiModel: result.model,
        expiresAt
      });
      console.log(`[AI Router] Cached response saved: ${cacheKey}`);
    } catch (cacheError) {
      console.error("[AI Router] Cache save error:", cacheError);
    }

    return result.output;
  }
};
