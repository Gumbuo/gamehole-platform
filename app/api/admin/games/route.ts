import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin, getAllGamesForAdmin } from "@/lib/db";

export async function GET(request: NextRequest) {
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

    const games = await getAllGamesForAdmin();

    return NextResponse.json({ games });
  } catch (error: any) {
    console.error("Get admin games error:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
