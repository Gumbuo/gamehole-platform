import { NextResponse } from "next/server";
import { getFeaturedGames } from "@/lib/db";

export async function GET() {
  try {
    const games = await getFeaturedGames(6);

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Featured games error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured games" },
      { status: 500 }
    );
  }
}
