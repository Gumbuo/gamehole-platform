import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, isAdmin } from "@/lib/db";
import { del } from "@vercel/blob";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, adminOverride } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug" },
        { status: 400 }
      );
    }

    // Check if this is an admin override request
    let isAdminUser = false;
    if (adminOverride) {
      isAdminUser = await isAdmin(session.user.email);
      if (!isAdminUser) {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
    }

    // Get user from database
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Get the game to verify ownership and get blob URL
    const gameResult = await sql`
      SELECT id, user_id, blob_url FROM games WHERE slug = ${slug}
    `;

    if (gameResult.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = gameResult[0];

    // Verify the user owns this game (skip if admin override)
    if (!isAdminUser && game.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this game" },
        { status: 403 }
      );
    }

    // Delete the blob file
    try {
      await del(game.blob_url);
    } catch (blobError) {
      console.error("Error deleting blob:", blobError);
      // Continue even if blob deletion fails
    }

    // Delete the game from database
    await sql`
      DELETE FROM games WHERE id = ${game.id}
    `;

    return NextResponse.json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete game",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
