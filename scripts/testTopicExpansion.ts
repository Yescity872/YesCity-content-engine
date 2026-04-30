import { expandTopicIntelligence } from "../services/topicExpansionService";
import { connectToDatabase } from "../lib/mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const testTopics = [
  { topic: "Hidden Street Food Delhi", category: "food" },
  { topic: "Jaipur Weekend Getaway", category: "travel" },
  { topic: "Eid Markets India", category: "festivals" },
  { topic: "IPL Fan Moments", category: "sports" },
  { topic: "Mumbai Monsoon Cafes", category: "food" },
];

async function runTest() {
  console.log("Starting Topic Expansion Engine Validation...");
  await connectToDatabase();

  for (const { topic, category } of testTopics) {
    console.log(`\n========================================`);
    console.log(`Testing: ${topic} (${category})`);
    console.log(`========================================`);

    const startTime = Date.now();
    // Use forceRefresh=true to guarantee we test Groq generation
    const result = await expandTopicIntelligence(topic, category, "IN", true);
    const duration = Date.now() - startTime;

    if (!result) {
      console.error(`Expansion failed for ${topic}`);
      continue;
    }
    console.log(`Duration: ${duration}ms | Source: ${result.source}`);
    console.log(`Instagram Hashtags:`, result.instagramHashtags);
    console.log(`YouTube Queries:`, result.youtubeQueries);
    console.log(`Google Trend Queries:`, result.googleTrendQueries);
    console.log(`News Queries:`, result.newsQueries);
    console.log(`X Queries:`, result.xQueries);
    console.log(`LinkedIn Queries:`, result.linkedinQueries);
    console.log(`Competitor Keywords:`, result.competitorKeywords);
    console.log(`Local Angles:`, result.localAngles);
    console.log(`Content Formats:`, result.contentFormats);
  }

  // Test caching logic
  console.log(`\n========================================`);
  console.log(`Testing Cache Logic for: ${testTopics[0].topic}`);
  console.log(`========================================`);
  const cacheStartTime = Date.now();
  const cacheResult = await expandTopicIntelligence(testTopics[0].topic, testTopics[0].category, "IN", false);
  const cacheDuration = Date.now() - cacheStartTime;
  if (cacheResult) {
    console.log(`Cache Duration: ${cacheDuration}ms | Source: ${cacheResult.source}`);
  }

  mongoose.connection.close();
  console.log("\nValidation Complete.");
}

runTest().catch(console.error);
