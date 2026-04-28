export interface FallbackReference {
  url: string;
  mediaType: "reel" | "post";
  aiCaption: string;
}

export const curatedReferences: Record<string, FallbackReference[]> = {
  geopolitics: [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Global affairs update and international news summary." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Visual breakdown of current global diplomatic shifts." }
  ],
  sports: [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Incredible stadium atmosphere and fan celebration." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Major sporting event highlights and viral moments." }
  ],
  entertainment: [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Behind-the-scenes look at the latest viral production." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Celebrity trend analysis and red carpet highlights." }
  ],
  anime: [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Stunning anime-inspired aesthetic and visual art." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Trending anime community discussion and fan art." }
  ],
  "student life": [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Relatable student POV on study sessions and campus life." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Productivity hacks for college and hostel living." }
  ],
  food: [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Must-try street food gems and urban food exploration." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Traditional recipe with a modern viral twist." }
  ],
  travel: [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Hidden travel gems and offbeat weekend destination." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Sustainable travel guide for conscious explorers." }
  ],
  memes: [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Relatable POV meme capturing current digital culture." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Trending viral format and expectation vs reality humor." }
  ],
  "tech/AI": [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Mind-blowing AI tools and future technology showcase." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "New gadgets that are changing daily city efficiency." }
  ],
  festivals: [
    { url: "https://www.instagram.com/reels/C8S6S_SsxW-/", mediaType: "reel", aiCaption: "Vibrant festival celebrations and cultural heritage." },
    { url: "https://www.instagram.com/p/C7_3z-SsxW-/", mediaType: "post", aiCaption: "Community gathering for a traditional local event." }
  ]
};
