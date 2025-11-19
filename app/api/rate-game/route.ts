import { NextRequest, NextResponse } from "next/server";
import { rateGame } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, rating } = body;

    if (!slug || !rating) {
      return NextResponse.json(
        { error: "Missing slug or rating" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await rateGame(slug, rating);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Rate game error:", error);
    return NextResponse.json(
      { error: "Failed to rate game" },
      { status: 500 }
    );
  }
}
