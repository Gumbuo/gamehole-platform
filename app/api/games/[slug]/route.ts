import { NextRequest, NextResponse } from "next/server";
import { getGame, incrementGameViews } from "@/lib/db";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const game = await getGame(params.slug);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Increment view count
    await incrementGameViews(params.slug);

    return NextResponse.json({ game });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
