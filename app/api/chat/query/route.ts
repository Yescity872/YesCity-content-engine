import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 });

    console.log(`[ChatQuery] Processing: "${query}"`);

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `You are the YesCity AI Content Engine assistant. 
          A user is asking about specific trends or marketing advice. 
          
          Guidelines:
          1. Provide a helpful, concise, and professional response.
          2. USE POINTS (bullet points) and clear headings. DO NOT use long paragraphs.
          3. Explain what is currently popular related to their query and WHY.
          4. Offer 1-2 actionable marketing strategies for YesCity (Indian city discovery).
          5. Include 3-5 suggested hashtags or search terms.
          6. Mention that live references and visual cards can be fetched using the "Discover Trends" feature.
          7. Be encouraging and human-readable.` 
        },
        { role: "user", content: query },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content || "I'm sorry, I couldn't process that request right now.";

    return NextResponse.json({ success: true, content: responseText });

  } catch (error: any) {
    console.error("[ChatQuery] API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
