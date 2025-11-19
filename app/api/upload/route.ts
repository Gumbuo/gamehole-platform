import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const slug = formData.get("slug") as string;

    if (!file || !title || !slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

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

    // Upload file to Vercel Blob
    let blob;
    try {
      blob = await put(`games/${slug}/${file.name}`, file, {
        access: "public",
      });
    } catch (blobError: any) {
      console.error("Blob upload error:", blobError);
      return NextResponse.json(
        {
          error: "Failed to upload file to blob storage",
          details: blobError.message || String(blobError)
        },
        { status: 500 }
      );
    }

    // Save game to database
    const result = await sql`
      INSERT INTO games (user_id, title, description, slug, blob_url)
      VALUES (${userId}, ${title}, ${description}, ${slug}, ${blob.url})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      game: result[0],
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload game",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
