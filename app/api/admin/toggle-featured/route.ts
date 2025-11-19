import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin, toggleGameFeatured } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await isAdmin(session.user.email);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug" },
        { status: 400 }
      );
    }

    await toggleGameFeatured(slug);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Toggle featured error:", error);
    return NextResponse.json(
      { error: "Failed to toggle featured status" },
      { status: 500 }
    );
  }
}
