import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TrendDetail from "@/models/TrendDetail";
import ScrapedPost from "@/models/ScrapedPost";
import { analyzeTrendAndGenerateIdeas } from "@/services/groqService";
import { scrapeInstagram, saveScrapedPosts } from "@/services/instagramScraper";

export async function POST(request: Request) {
  try {
    const { sessionId, trendId, trendTitle, hashtags, classification } = await request.json();
    
    await connectToDatabase();

    // 1. Check if Detail already exists
    const existingDetail = await TrendDetail.findOne({ sessionId, trendId });
    if (existingDetail) {
      return NextResponse.json({ success: true, detail: existingDetail });
    }

    // 2. Scrape additional related posts based on hashtags
    const additionalPosts = await scrapeInstagram([hashtags?.[0] || trendTitle]);
    const savedAdditional = await saveScrapedPosts(additionalPosts);

    // 3. Collect captions for AI analysis
    const relatedPosts = await ScrapedPost.find({ 
      $or: [
        { hashtags: { $in: hashtags || [] } },
        { caption: { $regex: trendTitle, $options: "i" } }
      ]
    }).limit(10);

    const captions = relatedPosts.map(p => p.caption);

    // 4. Generate AI Analysis and Ideas
    const aiResult = await analyzeTrendAndGenerateIdeas(trendTitle, captions, classification || "indirect");

    // 5. Save and Return
    const detail = await TrendDetail.create({
      sessionId,
      trendId,
      topic: trendTitle,
      relatedPosts: relatedPosts
        .filter(p => p.mediaType === "post")
        .map(p => ({ 
          url: p.postUrl, 
          caption: p.caption, 
          mediaType: "post", 
          sourceType: p.sourceType || "live" 
        })),
      relatedReels: relatedPosts
        .filter(p => p.mediaType === "reel")
        .map(p => ({ 
          url: p.postUrl, 
          caption: p.caption, 
          mediaType: "reel", 
          sourceType: p.sourceType || "live" 
        })),
      aiAnalysis: aiResult.aiAnalysis,
      postIdeas: aiResult.postIdeas,
      reelIdeas: aiResult.reelIdeas,
    });

    return NextResponse.json({
      success: true,
      detail,
    });
  } catch (error: any) {
    console.error("Detail API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
