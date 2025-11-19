import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, slug, blobUrl } = body;

    if (!title || !slug || !blobUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
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

    // Check if slug already exists
    const existingGame = await sql`
      SELECT id FROM games WHERE slug = ${slug}
    `;

    if (existingGame.length > 0) {
      return NextResponse.json(
        { error: "A game with this slug already exists" },
        { status: 409 }
      );
    }

    // Save game to database
    const result = await sql`
      INSERT INTO games (user_id, title, description, slug, blob_url)
      VALUES (${userId}, ${title}, ${description}, ${slug}, ${blobUrl})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      game: result[0],
    });
  } catch (error: any) {
    console.error("Save game error:", error);
    return NextResponse.json(
      {
        error: "Failed to save game",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
