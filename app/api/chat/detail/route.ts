import { NextResponse } from "next/server";
import { getOrCreateTrendDetail } from "@/services/trendDetailService";

/**
 * @deprecated Transitioning to /api/trends/* logic, but kept for compatibility during migration.
 */
export async function POST(request: Request) {
  try {
    const { topicId } = await request.json();
    if (!topicId) throw new Error("topicId is required");

    const detail = await getOrCreateTrendDetail(topicId);

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
