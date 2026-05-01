import { fetchNewsSignals } from "./newsApiService";
import { fetchYouTubeSignals } from "./youtubeApiService";
import { fetchGoogleTrendSignals } from "./googleTrendsService";
import { curatedTopicBank } from "@/data/curatedTopicBank";
import TrendTopic, { ITrendTopic } from "@/models/TrendTopic";
import TrendReference from "@/models/TrendReference";
import TrendSession from "@/models/TrendSession";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";
import { aiRouter } from "./ai/aiRouter";
import crypto from "crypto";

/**
 * Orchestrates topic discovery from multi-source signals.
 */
export async function getOrCreateWeeklyTopics(weekId: string, forceRefresh: boolean = false): Promise<ITrendTopic[]> {
  await connectToDatabase();

  // 0. Maintenance: Clear stale references older than 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await TrendReference.deleteMany({ scrapedAt: { $lt: oneDayAgo } });

  // 1. Check if topics already exist
  if (!forceRefresh) {
    const existingCount = await TrendTopic.countDocuments({ weekId });
    if (existingCount >= 10) {
      const topics = await TrendTopic.find({ weekId });
      return topics.sort(() => Math.random() - 0.5);
    }
  }

  // Clean up old week data
  await TrendTopic.deleteMany({ weekId });

  // 2. Fetch Signals
  const newsSignals = await fetchNewsSignals().catch(() => []);
  const youtubeSignals = await fetchYouTubeSignals().catch(() => []);
  const googleSignals = await fetchGoogleTrendSignals().catch(() => []);
  
  const allSignals = [
    ...newsSignals.map((s: any) => `News: ${s.title}`),
    ...youtubeSignals.map((s: any) => `YouTube: ${s.title}`),
    ...googleSignals.map((s: any) => `GoogleTrend: ${s.title} (${s.traffic} searches)`)
  ];

  // 3. AI Orchestration via Router
  let topicsList: any[] = [];
  try {
    const systemPrompt = `You are a Trend Discovery AI for YesCity, focusing on Indian culture and city life.
Your goal is to identify 30 current, real-world trend topics based on the provided SIGNALS.

Rules:
1. LIVE PRIORITY: Heavily prioritize the provided GoogleTrends and News signals. If a signal is a person or specific event, adapt it into a marketing trend (e.g. "IPL Fan Culture" or "Local Election Street Vibes").
2. NICHE FOCUS: Include Indian festivals (Navratri, Holi, etc.), street food, and cultural nuances.
3. Return EXACTLY 30 topics.
4. Each topic MUST have:
   - title: Specific and real.
   - category: One of [festivals, food, travel, memes, student life, entertainment, tech/AI, sports]
   - contextSummary: 1-2 sentences explaining the trend/signal connection.
   - classification: "direct", "adaptable", or "sensitive".
   - yesCityAngle: Marketing strategy for YesCity brand.
   - hashtags: 4-5 relevant Instagram hashtags (WITHOUT #).

Return ONLY a JSON object with key "topics".`;

    const randomSeed = Math.random().toString(36).substring(7);
    const response = await aiRouter.generateStructured({
      purpose: "topicDiscovery",
      systemPrompt: `${systemPrompt}\n\nSeed: ${randomSeed}. Pick DIFFERENT topics than usual if possible.`,
      userPrompt: `Signals: ${allSignals.join(" | ")}`,
      inputForCache: { weekId, seed: randomSeed, signalsHash: crypto.createHash("md5").update(allSignals.join("|")).digest("hex") },
      forceRefresh: forceRefresh
    });

    topicsList = Array.isArray(response.topics) ? response.topics : [];
  } catch (error) {
    console.error("[TrendTopic] AI Router failed. Falling back to bank.");
    topicsList = [...curatedTopicBank]
      .sort(() => Math.random() - 0.5)
      .slice(0, 30)
      .map(c => ({
        title: c.title,
        category: c.category,
        contextSummary: "Current trending Indian cultural moment.",
        classification: "adaptable",
        yesCityAngle: "Adapt this for a city discovery guide.",
        hashtags: c.tags
      }));
  }

  // 4. Save 10 random topics for the week
  const finalTopicsData = topicsList
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map((topic, index) => ({
      ...topic,
      topicId: `topic_${uuidv4()}`,
      weekId,
      batchNumber: index < 5 ? 1 : 2,
      status: "pending",
      createdAt: new Date(),
      hashtags: (topic.hashtags || []).map((h: string) => h.replace(/^#/, ''))
    }));

  await TrendTopic.insertMany(finalTopicsData);
  return await TrendTopic.find({ weekId }).sort({ batchNumber: 1 });
}

export async function getTopicBatch(weekId: string, batchNumber: number): Promise<ITrendTopic[]> {
  await connectToDatabase();
  return TrendTopic.find({ weekId, batchNumber });
}

export async function generateFallbackIntelligence(topicId: string): Promise<ITrendTopic | null> {
  await connectToDatabase();
  const topic = await TrendTopic.findOne({ topicId });
  if (!topic) return null;

  try {
    const systemPrompt = `You are a Trend Intelligence Engine for YesCity.
Analyze this Indian trend and build a full marketing execution report.
Topic: ${topic.title}. Return JSON.`;

    const report = await aiRouter.generateStructured({
      purpose: "fallbackIntelligence",
      systemPrompt: systemPrompt,
      userPrompt: "Generate detailed execution strategy in JSON format.",
      inputForCache: { topicId: topic.topicId, title: topic.title }
    });

    topic.intelligenceReport = report;
    topic.markModified("intelligenceReport");
    await topic.save();
    return topic;
  } catch (error) {
    console.error("[TrendTopic] Fallback failed.");
    return topic;
  }
}

/**
 * PHASE 2: Discover a specific topic on-the-fly
 */
export async function discoverSpecificTopic(keyword: string): Promise<ITrendTopic[]> {
  await connectToDatabase();

  // 1. Check if it already exists
  const existing = await TrendTopic.findOne({ title: { $regex: new RegExp(`^${keyword}$`, "i") } });
  if (existing) return [existing];

  const systemPrompt = `You are the Lead Creative Director for YesCity.
Create a structured research package for this specific keyword: "${keyword}".

Rules:
1. CATEGORY: Assign one of [festivals, food, travel, memes, student life, entertainment, tech/AI, sports].
2. CONTEXT: Write 1-2 sentences explaining what this trend is about in India.
3. ADAPTATION: Write a 1-sentence YesCity marketing angle.
4. Return JSON object with: title, category, contextSummary, classification ("direct", "adaptable", "sensitive"), yesCityAngle, hashtags (array of 5).`;

  const topicData = await aiRouter.generateStructured({
    purpose: "trendDetail",
    systemPrompt: systemPrompt,
    userPrompt: `Create a structured research package for this specific keyword: "${keyword}".`,
    inputForCache: { keyword }
  });
  
  const newTopic = await TrendTopic.create({
    topicId: `live_${uuidv4()}`,
    weekId: "live_discovery",
    title: topicData.title || keyword,
    category: topicData.category || "general",
    contextSummary: topicData.contextSummary || "Direct signal research.",
    classification: topicData.classification || "adaptable",
    yesCityAngle: topicData.yesCityAngle || "Adapt this for city discovery.",
    hashtags: topicData.hashtags || [],
    status: "ready", 
    batchNumber: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return [newTopic];
}

