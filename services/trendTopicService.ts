import { fetchNewsSignals } from "./newsApiService";
import { fetchYouTubeSignals } from "./youtubeApiService";
import { fetchGoogleTrendSignals } from "./googleTrendsService";
import { curatedTopicBank } from "@/data/curatedTopicBank";
import TrendTopic, { ITrendTopic } from "@/models/TrendTopic";
import TrendReference from "@/models/TrendReference";
import TrendSession from "@/models/TrendSession";
import Groq from "groq-sdk";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Orchestrates topic discovery from multi-source signals.
 */
export async function getOrCreateWeeklyTopics(weekId: string, forceRefresh: boolean = false): Promise<ITrendTopic[]> {
  await connectToDatabase();

  // 0. Maintenance: Clear stale references older than 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await TrendReference.deleteMany({ scrapedAt: { $lt: oneDayAgo } });

  // 1. Check if topics already exist
  const existingCount = await TrendTopic.countDocuments({ weekId });
  if (!forceRefresh && existingCount >= 10) {
    const topics = await TrendTopic.find({ weekId });
    return topics.sort(() => Math.random() - 0.5);
  }

  // Clean up old week data
  await TrendTopic.deleteMany({ weekId });

  // 2. Fetch Signals
  const newsSignals = await fetchNewsSignals().catch(() => []);
  const youtubeSignals = await fetchYouTubeSignals().catch(() => []);
  const googleSignals = await fetchGoogleTrendSignals().catch(() => []);
  
  const allSignals = [
    ...newsSignals.map(s => `News: ${s.title}`),
    ...youtubeSignals.map(s => `YouTube: ${s.title}`),
    ...googleSignals.map(s => `GoogleTrend: ${s.title} (${s.traffic} searches)`)
  ];

  // 3. Groq Orchestration
  let structuredTopics: any[] = [];
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

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Signals: ${allSignals.join(" | ")}` },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "";
    structuredTopics = JSON.parse(content).topics || [];
  } catch (error) {
    console.error("[TrendTopic] Groq failed. Falling back to bank.");
    structuredTopics = [...curatedTopicBank]
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
  const finalTopicsData = structuredTopics
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
Topic: ${topic.title}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate detailed execution strategy in JSON format." },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "";
    let report = JSON.parse(content);

    topic.intelligenceReport = report;
    topic.markModified("intelligenceReport");
    await topic.save();
    return topic;
  } catch (error) {
    console.error("[TrendTopic] Fallback failed.");
    return topic;
  }
}
