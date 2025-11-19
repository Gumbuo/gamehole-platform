import { NextResponse } from "next/server";
import { getAllGames } from "@/lib/db";

export async function GET() {
  try {
    const games = await getAllGames();
    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
