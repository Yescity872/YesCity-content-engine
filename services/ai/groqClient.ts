import Groq from "groq-sdk";

/**
 * Purpose-specific Key Selection
 */
function getApiKeyForPurpose(purpose?: string): string {
  switch (purpose) {
    case "competitorAnalysis":
      return process.env.GROQ_KEY_COMPETITOR || process.env.GROQ_API_KEY || "";
    case "dailyTrendAnalysis":
    case "trendDetail":
    case "topicDiscovery":
    case "topicExpansion":
      return process.env.GROQ_KEY_TRENDS || process.env.GROQ_API_KEY || "";
    case "postReelIdeas":
    case "quickIdeaUpgrade":
      return process.env.GROQ_KEY_IDEAS || process.env.GROQ_API_KEY || "";
    default:
      return process.env.GROQ_API_KEY || "";
  }
}

const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

export const generateWithGroq = async (systemPrompt: string, userPrompt: string, purpose?: string) => {
  const apiKey = getApiKeyForPurpose(purpose);
  
  if (!apiKey) {
    console.error(`[GroqClient] ❌ NO API KEY FOUND for purpose: ${purpose}`);
    return null;
  }

  // Masked key for logging
  const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`[GroqClient] 🔑 Using Key: ${maskedKey} for Purpose: ${purpose}`);

  const groq = new Groq({ apiKey });

  for (const model of MODELS) {
    try {
      console.log(`[GroqClient] 🚀 [${purpose}] Calling Groq with model: ${model}...`);
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `${systemPrompt}\n\nIMPORTANT: Return valid JSON.` },
          { role: "user", content: userPrompt },
        ],
        model: model,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content || "{}";
      const cleanedContent = content.replace(/```json\n?|```/g, "").trim();
      
      console.log(`[GroqClient] ✅ Success [${purpose}] using ${model}`);

      return {
        output: JSON.parse(cleanedContent),
        model: model,
        provider: "groq"
      };
    } catch (error: any) {
      console.error(`[GroqClient] ⚠️ Error with ${model} for ${purpose}:`, error.message);
      if (error?.status === 429 && model !== MODELS[MODELS.length - 1]) {
        console.warn(`[GroqClient] ⏳ Rate limit hit for ${model} (${purpose}). Falling back...`);
        continue;
      }
      if (model === MODELS[MODELS.length - 1]) {
        console.error(`[GroqClient] 💀 ALL MODELS FAILED for ${purpose}`);
        return null;
      }
    }
  }
  return null;
};
