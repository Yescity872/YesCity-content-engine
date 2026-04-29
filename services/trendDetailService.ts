import { connectToDatabase } from "@/lib/mongodb";
import TrendTopic from "@/models/TrendTopic";
import TrendReference from "@/models/TrendReference";
import TrendDetail from "@/models/TrendDetail";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Generates or retrieves detailed trend analysis and content ideas.
 */
export async function getOrCreateTrendDetail(topicId: string): Promise<any> {
  await connectToDatabase();

  // 1. Check cache
  const existing = await TrendDetail.findOne({ topicId });
  if (existing) return existing;

  // 2. Fetch context
  const topic = await TrendTopic.findOne({ topicId });
  if (!topic) throw new Error("Topic not found");

  const references = await TrendReference.find({ topicId });
  const referenceCaptions = references.map(r => r.aiCaption).join(" | ");

  // 3. AI Generation
  console.log(`[TrendDetail] Generating AI analysis for "${topic.title}"...`);
  
  const systemPrompt = `You are a Trend Analyst for YesCity.
Analyze this topic and generate content ideas for Indian city discovery.

Topic: ${topic.title}
Category: ${topic.category}
Context: ${topic.contextSummary}
Reference Captions: ${referenceCaptions}

Return a JSON object:
{
  "aiAnalysis": {
    "whatItIs": "Deep explanation of the trend",
    "whyTrending": "Why it is viral now",
    "howPeopleUsing": "Usage patterns in reels/posts",
    "brandSafetyNote": "Safety/suitability for brands",
    "yesCityAngle": "Specific strategy for YesCity"
  },
  "postIdeas": [ // MUST BE EXACTLY 5
    {
      "title": "Strategy name",
      "conceptSummary": "Why this works for a static post/carousel",
      "hook": "Strong opening text",
      "caption": "Full caption with hashtags",
      "cta": "Call to action",
      "sceneBreakdown": ["Slide 1 content", "Slide 2 content", "..."],
      "aiVideoPrompt": "Descriptive prompt for a high-quality static image or carousel slide"
    }
  ],
  "reelIdeas": [ // MUST BE EXACTLY 5
    {
      "title": "Strategy name",
      "conceptSummary": "Why this works for a reel",
      "hook": "Strong verbal hook",
      "caption": "Full reel caption",
      "cta": "Call to action",
      "sceneBreakdown": ["0-3s: Action", "3-7s: Action", "..."],
      "aiVideoPrompt": "Dynamic prompt for a cinematic AI video"
    }
  ]
}`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate analysis and ideas for the "${topic.title}" trend.` },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content || "";
  const aiResult = JSON.parse(content);

  // 4. Normalize and Save to DB
  const normalizeIdeas = (ideas: any[]) => ideas.map(idea => ({
    ...idea,
    sceneBreakdown: Array.isArray(idea.sceneBreakdown) 
      ? idea.sceneBreakdown 
      : typeof idea.sceneBreakdown === "string" 
        ? [idea.sceneBreakdown] 
        : []
  }));

  // Clean up any old failed records for this topic before saving new one
  await TrendDetail.deleteMany({ topicId });

  const detail = await TrendDetail.create({
    topicId,
    topicTitle: topic.title,
    aiAnalysis: aiResult.aiAnalysis,
    postIdeas: normalizeIdeas(aiResult.postIdeas || []),
    reelIdeas: normalizeIdeas(aiResult.reelIdeas || []),
  });

  return detail;
}
