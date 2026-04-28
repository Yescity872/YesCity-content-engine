import { fetchNewsSignals } from "./newsApiService";
import { fetchYouTubeSignals } from "./youtubeApiService";
import { curatedTopicBank } from "@/data/curatedTopicBank";
import TrendTopic, { ITrendTopic } from "@/models/TrendTopic";
import TrendReference from "@/models/TrendReference";
import TrendSession from "@/models/TrendSession";
import Groq from "groq-sdk";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";
import { generateHashtags } from "./topicHashtagService";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

async function generateCustomTopic(query: string, weekId: string): Promise<ITrendTopic> {
  const completion = await groq.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: `You are an AI trend analyzer for YesCity. 
        Given a user query, generate a JSON object for a single TrendTopic.
        
        Fields:
        - title: Catchy trend name
        - category: One of [geopolitics, sports, entertainment, anime, student life, food, travel, memes, tech/AI, festivals]
        - contextSummary: 1 sentence why it is viral
        - classification: "direct" | "adaptable" | "sensitive"
        - yesCityAngle: A specific strategy for Indian city discovery content.` 
      },
      { role: "user", content: `Generate a trend topic for: ${query}` },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  const topicData = JSON.parse(completion.choices[0].message.content || "{}");
  const topic = await TrendTopic.create({
    topicId: `custom-${uuidv4().slice(0, 8)}`,
    ...topicData,
    weekId,
    batchNumber: 0,
    status: "pending",
    hashtags: generateHashtags(topicData.title, topicData.category),
    sourceSignals: ["custom_query"]
  });

  return topic;
}

/**
 * Orchestrates topic discovery from multi-source signals.
 */
export async function getOrCreateWeeklyTopics(weekId: string, forceRefresh: boolean = false, query?: string): Promise<ITrendTopic[]> {
  await connectToDatabase();

  // A. Custom Query Handling (Always creates a fresh unique topic)
  if (query) {
    console.log(`[TrendTopic] Generating custom topic for query: "${query}"`);
    return [await generateCustomTopic(query, weekId)];
  }

  // 1. Check if topics already exist for this week
  if (!forceRefresh) {
    const existing = await TrendTopic.find({ weekId }).sort({ batchNumber: 1 });
    if (existing.length >= 10) {
      return existing;
    }
  } else {
    console.log(`[TrendTopic] Force refresh requested for ${weekId}. Clearing old topics...`);
    await TrendTopic.deleteMany({ weekId });
    // Also clear references for these topics
    const oldTopics = await TrendTopic.find({ weekId });
    const oldTopicIds = oldTopics.map(t => t.topicId);
    await TrendReference.deleteMany({ topicId: { $in: oldTopicIds } });
  }

  console.log(`[TrendTopic] Generating new weekly topics for ${weekId}...`);

  // 2. Fetch Signals
  const newsSignals = await fetchNewsSignals();
  const youtubeSignals = await fetchYouTubeSignals();
  
  // Select 10 diverse candidates from curated bank (rotate logic)
  const curatedCandidates = curatedTopicBank
    .sort((a, b) => (b.freshnessWeight || 1) - (a.freshnessWeight || 1))
    .slice(0, 15);

  const allSignals = [
    ...newsSignals.map(s => `News: ${s.title}`),
    ...youtubeSignals.map(s => `YouTube: ${s.title}`),
    ...curatedCandidates.map(c => `Curated: ${c.title} (${c.category})`)
  ];

  // 3. Groq Orchestration
  let structuredTopics: any[] = [];
  try {
    const systemPrompt = `You are a Trend Discovery AI for YesCity. 
Your goal is to identify 10 current, real-world trend topics based on provided signals.
Signals are from news, YouTube, and a curated bank.

Rules:
1. Return EXACTLY 10 topics.
2. Group them into batches: topics 1-5 as batch 1, topics 6-10 as batch 2.
3. Each topic MUST have:
   - title: Specific and real (e.g. "Airport Fit Check", NOT "Travel")
   - category: One of [geopolitics, sports, entertainment, anime, student life, food, travel, memes, tech/AI, festivals]
   - contextSummary: 1-2 sentences explaining why it's trending.
   - classification: "direct" (travel related), "adaptable" (meme/culture), or "sensitive" (serious news).
   - yesCityAngle: Specific strategy for YesCity (Indian city discovery brand).
     Examples: 
     - "Create a city food trail series around hidden stalls in Delhi, Lucknow, or Kolkata."
     - "Create event-based city guides: where to stay, eat, and explore before/after a concert."
     - "Show planned vs actual weekend experiences in Indian cities."
     - "Create festival city guides around markets, food, outfits, and rituals."

Return ONLY a JSON object with key "topics" containing the array.`;

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
    console.error("[TrendTopic] Groq failed. Falling back to curated bank.", error);
    // Fallback: Use curated bank directly
    structuredTopics = curatedCandidates.slice(0, 10).map((c, i) => {
      let specificAngle = "Adapt this viral format to showcase a unique city experience in India.";
      if (c.category === "food") specificAngle = "Create a city food trail series around hidden stalls in Delhi, Lucknow, or Kolkata.";
      if (c.category === "travel") specificAngle = "Show planned vs actual weekend experiences in Indian cities like Jaipur or Coorg.";
      if (c.category === "festivals") specificAngle = "Create festival city guides around local markets, food, outfits, and rituals.";
      if (c.category === "entertainment") specificAngle = "Create event-based city guides: where to stay, eat, and explore before/after a major show.";

      return {
        title: c.title,
        category: c.category,
        contextSummary: `A trending topic in the ${c.category} space.`,
        classification: "adaptable",
        yesCityAngle: specificAngle
      };
    });
  }

  // 4. Store in MongoDB
  const savedTopics: ITrendTopic[] = [];
  for (let i = 0; i < structuredTopics.length; i++) {
    const topicData = structuredTopics[i];
    const topicId = uuidv4();
    const batchNumber = i < 5 ? 1 : 2;
    
    const topic = await TrendTopic.create({
      topicId,
      title: topicData.title,
      category: topicData.category,
      contextSummary: topicData.contextSummary,
      classification: topicData.classification || "adaptable",
      yesCityAngle: topicData.yesCityAngle,
      weekId,
      batchNumber,
      status: "pending",
      hashtags: generateHashtags(topicData.title, topicData.category),
      sourceSignals: ["groq"] // Simplified for now
    });
    savedTopics.push(topic);
  }

  return savedTopics;
}

export async function getTopicBatch(weekId: string, batchNumber: number): Promise<ITrendTopic[]> {
  await connectToDatabase();
  return TrendTopic.find({ weekId, batchNumber });
}
