import TrendTopic from "@/models/TrendTopic";
import { connectToDatabase } from "@/lib/mongodb";
import { generateFallbackIntelligence } from "./trendTopicService";
import { getLiveReferencesForTopic } from "./liveReferenceService";
import { expandTopicIntelligence } from "./topicExpansionService";

/**
 * Orchestrates reference gathering using the new Live Reference Engine.
 */
export async function scrapeReferencesForTopic(topicId: string): Promise<void> {
  await connectToDatabase();
  
  const topic = await TrendTopic.findOne({ topicId });
  if (!topic) return;

  topic.status = "scraping";
  await topic.save();

  try {
    console.log(`[LiveRefs] Starting gathering for: "${topic.title}"`);
    
    // 1. Get expansion data if missing (needed for queries)
    const expansion = await expandTopicIntelligence(topic.title, topic.category, "IN");

    // 2. Call the new Live Reference Engine
    const references = await getLiveReferencesForTopic({
      topicId: topic.topicId,
      topic: topic.title,
      category: topic.category,
      topicExpansion: expansion
    });

    console.log(`[LiveRefs] Gathered ${references.length} references for "${topic.title}"`);

    // 3. Fallback logic: If no live references found, ensure intelligence report exists
    if (references.length === 0) {
      console.log(`[LiveRefs] No live references for "${topic.title}". Ensuring fallback intelligence exists...`);
      await generateFallbackIntelligence(topic.topicId);
    }

    topic.status = "ready";
    await topic.save();
    console.log(`[LiveRefs] Topic "${topic.title}" complete. Status: ready`);

  } catch (error) {
    console.error(`[LiveRefs] Critical failure for ${topicId}:`, error);
    topic.status = "ready"; // Fallback to ready anyway to not block UI
    await topic.save();
  }
}
