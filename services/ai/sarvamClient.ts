/**
 * Sarvam AI Client
 * Used as a high-quality secondary fallback for Indian context.
 * Strictly using free/credit-only endpoints.
 */

export const generateWithSarvam = async (systemPrompt: string, userPrompt: string) => {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.warn("[SarvamClient] API Key missing. Skipping.");
    return null;
  }

  try {
    console.log("[SarvamClient] Requesting completion...");
    // Note: This uses the standard Sarvam chat completion endpoint
    // Documentation: https://www.sarvam.ai/docs
    const response = await fetch("https://api.sarvam.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey
      },
      body: JSON.stringify({
        model: "sarvam-1", // Standard free-tier model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("[SarvamClient] API Error:", err);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content || "{}";
    const cleanedContent = content.replace(/```json\n?|```/g, "").trim();

    return {
      output: JSON.parse(cleanedContent),
      model: "sarvam-1",
      provider: "sarvam"
    };
  } catch (error: any) {
    console.error("[SarvamClient] Fetch Error:", error.message);
    return null;
  }
};
