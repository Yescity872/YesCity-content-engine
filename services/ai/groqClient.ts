import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

export const generateWithGroq = async (systemPrompt: string, userPrompt: string) => {
  if (!process.env.GROQ_API_KEY) {
    console.warn("[GroqClient] API Key missing. Skipping.");
    return null;
  }

  for (const model of MODELS) {
    try {
      console.log(`[GroqClient] Trying model: ${model}...`);
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: model,
        response_format: { type: "json_object" },
        timeout: 15000, // 15s timeout
      });

      const content = completion.choices[0].message.content || "{}";
      const cleanedContent = content.replace(/```json\n?|```/g, "").trim();
      
      return {
        output: JSON.parse(cleanedContent),
        model: model,
        provider: "groq"
      };
    } catch (error: any) {
      if (error?.status === 429 && model !== MODELS[MODELS.length - 1]) {
        console.warn(`[GroqClient] Rate limit hit for ${model}. Falling back...`);
        continue;
      }
      console.error(`[GroqClient] Error with ${model}:`, error.message);
      if (model === MODELS[MODELS.length - 1]) return null;
    }
  }
  return null;
};
