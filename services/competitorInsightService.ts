import CompetitorInsight from "@/models/CompetitorInsight";
import { connectToDatabase } from "@/lib/mongodb";
import { aiRouter } from "./ai/aiRouter";
import { searchCompetitorNews } from "./sourceAdapters/competitorNewsAdapter";
import { ICompetitorNewsSource } from "@/models/CompetitorNewsCache";

const PRIMARY_COMPETITORS = [
  "MakeMyTrip", 
  "Goibibo", 
  "Yatra", 
  "Cleartrip", 
  "Ixigo", 
  "EaseMyTrip", 
  "Booking.com India", 
  "Airbnb India", 
  "Thrillophilia", 
  "WanderOn", 
  "TravelTriangle", 
  "Holidify"
];

/**
 * Service to manage and generate enriched Competitor Insights (Phase 4 Overhaul).
 */
export async function getCompetitorInsights(region: string = "IN", forceRefresh: boolean = false) {
  await connectToDatabase();

  if (forceRefresh) {
    console.log("[CompetitorSvc] Force refresh triggered. Wiping local insights...");
    await CompetitorInsight.deleteMany({ region });
  }

  const insights = [];
  const list = PRIMARY_COMPETITORS;

  for (const name of list) {
    let insight = await CompetitorInsight.findOne({ competitorName: name, region });

    const isOld = insight && (new Date().getTime() - new Date(insight.updatedAt).getTime()) > 7 * 24 * 3600 * 1000;
    
    if (!insight || isOld || forceRefresh) {
      insight = await generateCompetitorInsight(name, region);
    }
    insights.push(insight);
  }

  return insights;
}

/**
 * Contextual Competitor Analysis Matrix for a specific trend topic.
 */
export async function getCompetitorAnalysisForTrend(topic: string, region: string = "IN") {
  console.log(`[CompetitorSvc] Generating Strategy Matrix for trend: ${topic}`);
  
  const systemPrompt = `You are a Competitive Intelligence Lead for YesCity.
Analyze how top Indian travel competitors would likely react to or are currently capturing this trend: "${topic}".

Compare these 4 types:
1. Booking Giants (MMT/Goibibo)
2. Activity Curators (Thrillophilia)
3. Youth/Community Brands (WanderOn)
4. Informational Guides (Holidify)

For each, identify:
- Likely Angle: How they frame it.
- Content Format: Post, Blog, Reel, etc.
- YesCity Opportunity: How we beat them with hyper-local content.

Return JSON:
{
  "matrix": [
    {
      "competitor": "MakeMyTrip",
      "likelyAngle": "e.g. Flight/Hotel deals near the trend",
      "format": "Offer-led banner",
      "yesCityOpportunity": "Local story vs generic discount"
    }
  ],
  "marketSentiment": "Summary of current industry buzz around this topic."
}`;

  try {
    const result = await aiRouter.generateStructured({
      purpose: "competitorAnalysis",
      systemPrompt,
      userPrompt: `Trend Topic: ${topic}\nRegion: ${region}`,
      inputForCache: { topic, region, type: "matrix_v2" }
    });
    return result;
  } catch (err) {
    return null;
  }
}

/**
 * Manual Ad Observation Analyzer
 */
export async function analyzeAdObservation(adContent: string) {
  const systemPrompt = `Analyze this competitor ad observation and break down its strategy for a local content creator (YesCity).
  
  Observation Input: "${adContent}"
  
  Return JSON:
  {
    "hookType": "e.g. FOMO / Discount / Benefit",
    "objective": "e.g. Conversion / Brand Awareness",
    "audience": "e.g. Budget travelers / Luxury seekers",
    "format": "e.g. Static Banner / Short Video",
    "yesCityResponse": "Strategic pivot for local content"
  }`;

  return await aiRouter.generateStructured({
    purpose: "competitorAnalysis",
    systemPrompt,
    userPrompt: `Analyze this ad: ${adContent}`,
    inputForCache: { adContent }
  });
}

/**
 * Generates an enriched internal competitor profile.
 */
async function generateCompetitorInsight(competitorName: string, region: string) {
  try {
    const adsPathway = `https://adstransparency.google.com/?region=${region}&q=${encodeURIComponent(competitorName)}`;
    
    // 1. Fetch Real Public Signals
    const newsSignals = await searchCompetitorNews({ competitorName, region });
    
    // Separate Recent vs Historical
    const recentSignals = newsSignals.filter((s: any) => s.freshness === "recent");
    const historicalSignals = newsSignals.filter((s: any) => s.freshness === "historical");

    const newsContext = newsSignals.length > 0 
      ? newsSignals.map((s: ICompetitorNewsSource) => `- [${s.source}] ${s.title} (${s.publishedAt}) [${s.freshness.toUpperCase()}]`).join("\n")
      : "No recent public news found.";

    // 2. Generate Analysis based on Signals + Known Profile
    const result = await aiRouter.generateStructured({
      purpose: "competitorAnalysis",
      systemPrompt: `Identify EXACTLY what this Indian travel competitor is doing right now in 2026.
      
      STRICT RULES:
      - I will provide PUBLIC SIGNALS. Some are labeled [RECENT] (last 7 days) and some [HISTORICAL] (older).
      - If a signal is [HISTORICAL], do NOT use it as the "Latest Campaign" or "What They Are Doing Now".
      - If there are NO [RECENT] signals, you MUST set 'latestCampaign' to "No recent public campaign found" and 'whatTheyAreDoingNow' to an AI-inferred market strategy based on 2026 trends.
      - Never hallucinate a 2024 celebrity campaign as a 2026 live move.
      
      Return JSON:
      {
        "whatTheyAreDoingNow": "Current tactical shift. If inferred, label: (AI Inferred: [Strategy])",
        "attractionSecret": "The specific psychological hook driving current clicks.",
        "latestCampaign": "The name of a VERIFIED RECENT campaign, or 'No recent public campaign found'",
        "liveTacticalMove": "A specific granular 2026 action."
      }`,
      userPrompt: `Competitor: ${competitorName}\nPublic Signals:\n${newsContext}`,
      inputForCache: { competitorName, region, version: "v8_strict_honesty" }
    });

    console.log(`[CompetitorSvc] AI Result for ${competitorName}:`, JSON.stringify(result, null, 2));

    const finalProofLinks = [
      { 
        title: "Official Website", 
        url: `https://www.google.com/search?q=${encodeURIComponent(competitorName)}+official+website`, 
        source: "Public Web" 
      },
      { 
        title: "Google Ads Transparency Center", 
        url: `https://adstransparency.google.com/?region=${region}&q=${encodeURIComponent(competitorName)}`, 
        source: "Google Ads" 
      }
    ];

    const finalData = {
      ...result,
      competitorName,
      region,
      isAIInferred: recentSignals.length === 0,
      publicSignals: newsSignals,
      proofLinks: finalProofLinks,
      updatedAt: new Date()
    };

    console.log(`[CompetitorSvc] Saving Data for ${competitorName}:`, JSON.stringify(finalData, null, 2));

    return await CompetitorInsight.findOneAndUpdate(
      { competitorName, region },
      finalData,
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`[CompetitorSvc] Failed for ${competitorName}:`, err);
    return null;
  }
}
