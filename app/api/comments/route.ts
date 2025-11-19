import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, getGameComments, addComment } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug" },
        { status: 400 }
      );
    }

    // Get game ID from slug
    const gameResult = await sql`
      SELECT id FROM games WHERE slug = ${slug}
    `;

    if (gameResult.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const comments = await getGameComments(gameResult[0].id);

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, content } = body;

    if (!slug || !content?.trim()) {
      return NextResponse.json(
        { error: "Missing slug or content" },
        { status: 400 }
      );
    }

    // Get user ID
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get game ID
    const gameResult = await sql`
      SELECT id FROM games WHERE slug = ${slug}
    `;

    if (gameResult.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const comment = await addComment(
      gameResult[0].id,
      userResult[0].id,
      content.trim()
    );

    // Get user info for response
    const commentWithUser = await sql`
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${comment.id}
    `;

    return NextResponse.json({
      success: true,
      comment: commentWithUser[0],
    });
  } catch (error: any) {
    console.error("Post comment error:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
