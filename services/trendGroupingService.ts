import { IScrapedPost } from "@/models/ScrapedPost";

export interface GroupedTrend {
  trendId: string;
  title: string;
  summary: string;
  hashtags: string[];
  posts: IScrapedPost[];
}

export function groupPostsIntoTrends(posts: IScrapedPost[]): GroupedTrend[] {
  const trends: GroupedTrend[] = [];
  const processedPostIds = new Set<string>();

  // 1. Group by hashtags
  const hashtagMap = new Map<string, string[]>(); // hashtag -> postIds
  posts.forEach((post) => {
    post.hashtags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      if (!hashtagMap.has(lowerTag)) {
        hashtagMap.set(lowerTag, []);
      }
      hashtagMap.get(lowerTag)?.push((post as any)._id?.toString() || post.postUrl);
    });
  });

  // Sort hashtags by frequency
  const sortedHashtags = Array.from(hashtagMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .filter(([tag]) => tag.length > 3); // Ignore very short tags

  // 2. Create trends from top hashtags
  for (const [tag, postIds] of sortedHashtags) {
    const trendPosts = posts.filter((p) => 
      postIds.includes((p as any)._id?.toString() || p.postUrl) && 
      !processedPostIds.has((p as any)._id?.toString() || p.postUrl)
    );

    if (trendPosts.length >= 1) {
      const trendId = `trend_${tag}_${Date.now()}`;
      trends.push({
        trendId,
        title: capitalize(tag),
        summary: `Trending content around #${tag}`,
        hashtags: [tag],
        posts: trendPosts,
      });
      
      trendPosts.forEach((p) => processedPostIds.add((p as any)._id?.toString() || p.postUrl));
    }
  }

  // 3. Group remaining posts into a "General Trends" trend
  const remainingPosts = posts.filter((p) => !processedPostIds.has((p as any)._id?.toString() || p.postUrl));
  if (remainingPosts.length > 0) {
    trends.push({
      trendId: `trend_general_${Date.now()}`,
      title: "General Viral Trends",
      summary: "Various trending content from across the platform",
      hashtags: ["trending"],
      posts: remainingPosts,
    });
  }

  // 4. Fallback: If no clusters formed, put everything in one "Global Viral Trends"
  if (trends.length === 0 && posts.length > 0) {
    console.log("No specific clusters found, applying last-resort grouping.");
    trends.push({
      trendId: "trend_fallback_" + Date.now(),
      title: "Global Viral Trends",
      summary: "A mix of broadly trending topics from across the platform.",
      hashtags: Array.from(new Set(posts.flatMap(p => p.hashtags))).slice(0, 5),
      posts: posts
    });
  }

  return trends;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
