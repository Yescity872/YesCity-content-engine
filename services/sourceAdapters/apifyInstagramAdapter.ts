import { connectToDatabase } from "@/lib/mongodb";
import ExternalApiUsage from "@/models/ExternalApiUsage";
import TrendReference, { ITrendReference } from "@/models/TrendReference";
import { aiRouter } from "../ai/aiRouter";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const ENABLE_APIFY_INSTAGRAM = process.env.ENABLE_APIFY_INSTAGRAM === "true";
const MONTHLY_BUDGET = parseFloat(process.env.APIFY_MONTHLY_BUDGET_USD || "5");
const DAILY_BUDGET = parseFloat(process.env.APIFY_DAILY_BUDGET_USD || "0.15");
const MAX_COST_PER_ACTION = parseFloat(process.env.APIFY_MAX_COST_PER_ACTION_USD || "0.03");
const MAX_RUNS_PER_DAY = parseInt(process.env.APIFY_MAX_RUNS_PER_DAY || "4");
const SCRAPE_RESULTS_PER_TOPIC = parseInt(process.env.APIFY_SCRAPE_RESULTS_PER_TOPIC || "2");

// Observed Cost Estimation: 25 results = $0.04
const getEstimatedCost = (resultsCount: number) => {
  return (resultsCount / 25) * 0.04;
};

export interface ApifyInstagramResult {
  success: boolean;
  references: Partial<ITrendReference>[];
  skipReason: string;
}

/**
 * Adapter for Apify Instagram Post Scraper.
 * Uses the synchronous endpoint for immediate dataset returns.
 */
export async function scrapeInstagramWithApify(topicId: string, topicTitle: string): Promise<ApifyInstagramResult> {
  await connectToDatabase();

  // 1. Basic Checks
  if (!ENABLE_APIFY_INSTAGRAM) return { success: false, references: [], skipReason: "disabled" };
  if (!APIFY_TOKEN) return { success: false, references: [], skipReason: "missing-token" };

  // 2. Cache Check (24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existingCount = await TrendReference.countDocuments({
    topicId,
    platform: "instagram",
    createdAt: { $gte: oneDayAgo }
  });
  if (existingCount > 0) return { success: false, references: [], skipReason: "cache-hit" };

  // 3. Budget & Usage Checks
  const now = new Date();
  const monthKey = now.toISOString().substring(0, 7);
  const dayKey = now.toISOString().substring(0, 10);

  const monthlyUsage = await ExternalApiUsage.aggregate([
    { $match: { provider: "apify", monthKey } },
    { $group: { _id: null, totalCost: { $sum: "$estimatedCostUsd" } } }
  ]);
  const dailyUsage = await ExternalApiUsage.findOne({ provider: "apify", dayKey });

  const currentMonthlyCost = monthlyUsage[0]?.totalCost || 0;
  const currentDailyCost = dailyUsage?.estimatedCostUsd || 0;
  const currentDailyRequests = dailyUsage?.requests || 0;

  if (currentMonthlyCost >= MONTHLY_BUDGET) return { success: false, references: [], skipReason: "monthly-budget-exceeded" };
  if (currentDailyCost >= DAILY_BUDGET) return { success: false, references: [], skipReason: "daily-budget-exceeded" };
  if (currentDailyRequests >= MAX_RUNS_PER_DAY) return { success: false, references: [], skipReason: "max-runs-exceeded" };

  // 4. Estimate Cost
  const estimatedCost = getEstimatedCost(SCRAPE_RESULTS_PER_TOPIC);
  if (estimatedCost > MAX_COST_PER_ACTION) return { success: false, references: [], skipReason: "estimated-action-cost-too-high" };

  console.log(`[ApifyAdapter] Synchronous call for: "${topicTitle}". Estimated: $${estimatedCost.toFixed(4)}`);

  try {
    // 5. Synchronous Actor Call
    // For general topics, we use hashtags. For specific brands, we use usernames.
    // We default to hashtag search for better variety unless it looks like a brand name.
    const isBrand = topicTitle.split(" ").length === 1 && !topicTitle.startsWith("#");
    const actorInput = isBrand 
      ? { username: [topicTitle.toLowerCase()], resultsLimit: SCRAPE_RESULTS_PER_TOPIC }
      : { hashtags: [topicTitle.replace(/\s+/g, "").replace("#", "")], resultsLimit: SCRAPE_RESULTS_PER_TOPIC };

    const actorId = "apify~instagram-post-scraper";
    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actorInput)
      }
    );

    if (!response.ok) {
      throw new Error(`Apify Sync Failed: ${response.statusText}`);
    }

    const items = await response.json();
    console.log(`[ApifyAdapter] Received ${items.length} items for "${topicTitle}"`);

    const validReferences = items.map((item: any) => ({
      topicId,
      platform: "instagram",
      sourceName: "Instagram",
      url: item.url,
      title: item.caption?.substring(0, 100) || "Instagram Post",
      description: item.caption || "",
      thumbnailUrl: item.displayUrl,
      mediaType: "post",
      engagement: {
        likes: item.likesCount,
        comments: item.commentsCount
      },
      sourceType: "live",
      scrapedAt: new Date()
    }));

    // 6. AI Marketing Note Generation
    for (const ref of validReferences) {
      ref.aiMarketingNote = await generateAiMarketingNote(topicTitle, ref);
    }

    // 7. Update Usage
    const actualCost = getEstimatedCost(validReferences.length);
    await ExternalApiUsage.findOneAndUpdate(
      { provider: "apify", monthKey, dayKey },
      { 
        $inc: { requests: 1, resultsFetched: validReferences.length, estimatedCostUsd: actualCost },
        $set: { lastRunAt: new Date() }
      },
      { upsert: true }
    );

    return {
      success: true,
      references: validReferences,
      skipReason: "none"
    };

  } catch (error) {
    console.error("[ApifyAdapter] Error:", error);
    // Track attempt overhead
    await ExternalApiUsage.findOneAndUpdate(
      { provider: "apify", monthKey, dayKey },
      { $inc: { requests: 1, estimatedCostUsd: getEstimatedCost(1) } },
      { upsert: true }
    );
    return { success: false, references: [], skipReason: "none" };
  }
}

async function generateAiMarketingNote(topic: string, ref: any): Promise<string> {
  try {
    const result = await aiRouter.generateStructured({
      purpose: "trendDetail",
      systemPrompt: "You are a YesCity production strategist. Explain how this Instagram post inspires city-discovery content. Return ONLY JSON: { \"instruction\": \"3-sentence strategy\" }.",
      userPrompt: `Topic: ${topic}\nCaption: ${ref.description || "N/A"}`,
      inputForCache: { topic, url: ref.url }
    });
    return result.instruction || "Adapt this visual format for a local city experience.";
  } catch {
    return "Adapt this visual format for a local city experience.";
  }
}
