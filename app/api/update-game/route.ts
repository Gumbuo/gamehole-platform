import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, title, description, category, credits } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug" },
        { status: 400 }
      );
    }

    // Get user from database
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Get the game to verify ownership
    const gameResult = await sql`
      SELECT id, user_id FROM games WHERE slug = ${slug}
    `;

    if (gameResult.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = gameResult[0];

    // Verify the user owns this game
    if (game.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to edit this game" },
        { status: 403 }
      );
    }

    // Update the game
    const result = await sql`
      UPDATE games
      SET
        title = ${title},
        description = ${description},
        category = ${category || 'Other'},
        credits = ${credits || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${game.id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      game: result[0],
    });
  } catch (error: any) {
    console.error("Update game error:", error);
    return NextResponse.json(
      {
        error: "Failed to update game",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
