import { NextRequest, NextResponse } from "next/server";
import { incrementGamePlays } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug" },
        { status: 400 }
      );
    }

    await incrementGamePlays(slug);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Increment play error:", error);
    return NextResponse.json(
      { error: "Failed to increment play count" },
      { status: 500 }
    );
  }
}
