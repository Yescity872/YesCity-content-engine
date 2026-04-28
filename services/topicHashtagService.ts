/**
 * Converts a topic title into searchable Instagram hashtags.
 * Focuses on high-volume, Indian-context tags that creators actually use.
 */
export function generateHashtags(title: string, category: string): string[] {
  const hashtags = new Set<string>();
  const titleLower = title.toLowerCase();
  
  // 1. Category-specific high-volume bases (Prioritize Indian Context)
  const categoryMap: Record<string, string[]> = {
    food: [
      "indianstreetfood", "streetfoodindia", "delhistreetfood", "mumbaistreetfood", 
      "kolkatastreetfood", "lucknowfood", "delhifoodie", "foodindia", "indianfoodreels"
    ],
    travel: [
      "travelindia", "weekendgetawayindia", "hiddenplacesindia", "indiatravelgram",
      "delhidiaries", "jaipurdiaries", "mumbaitravel", "indiantraveler"
    ],
    festivals: [
      "indianfestivals", "holifestival", "navratri", "durgapuja", "ganeshchaturthi", 
      "eidfestival", "christmasindia", "festivalmarket", "festiveindia"
    ],
    entertainment: ["concertindia", "bollywood", "celebrityindia", "entertainmentindia"],
    sports: ["cricketindia", "ipl2026", "footballindia", "sportsindia"],
    memes: ["relatable", "indianmemes", "funnyreelsindia", "trendingaudioindia"],
    anime: ["animeindia", "otakuindia", "animeaestheticindia"],
    "student life": ["collegelifeindia", "studentproblemsindia", "studygramindia"],
    "tech/ai": ["techindia", "aitoolsindia", "gadgetsindia", "smartcityindia"],
    geopolitics: ["currentaffairsindia", "indiaupdate", "globalnewsindia"]
  };

  const catKey = category.toLowerCase();
  let catTags = [...(categoryMap[catKey] || ["trending", "viral", "reelsindia"])];

  // For festivals, shuffle to avoid Diwali bias
  if (catKey === "festivals") {
    catTags = catTags.sort(() => Math.random() - 0.5);
  }

  // 2. City Detection (If title mentions a city, use its specific tags)
  const cities = ["delhi", "mumbai", "bangalore", "kolkata", "chennai", "hyderabad", "lucknow", "jaipur", "pune", "ahmedabad"];
  const matchedCity = cities.find(city => titleLower.includes(city));
  
  if (matchedCity) {
    const cityTags = catTags.filter(t => t.includes(matchedCity));
    cityTags.forEach(t => hashtags.add(t));
  }

  // 3. Add base category tags
  catTags.slice(0, 3).forEach(t => hashtags.add(t));

  // 4. Extract keywords from title and clean them
  const keywords = titleLower
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(w => w.length > 3 && !["with", "this", "that", "from", "urban", "cities", "dwellers", "viral", "trends", "life", "prep"].includes(w));

  if (keywords.length > 0) {
    hashtags.add(keywords[0]);
    if (hashtags.size < 4) hashtags.add(`${keywords[0]}india`);
  }

  return Array.from(hashtags).slice(0, 4);
}
