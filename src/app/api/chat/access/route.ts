import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/chat/access - Get users BLOCKED from chat
export async function GET(request: NextRequest) {
  try {
    const blockedList = await prisma.chatAccess.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    return NextResponse.json(blockedList.map((a: any) => ({
      userId: a.userId,
      name: a.user.name,
      email: a.user.email,
      avatar: a.user.avatar,
    })));
  } catch (error) {
    console.error("Failed to fetch blocked list:", error);
    return NextResponse.json({ error: "Failed to fetch blocked list" }, { status: 500 });
  }
}

// POST /api/chat/access - BLOCK user from chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, adminId } = body;

    if (!userId || !adminId) {
      return NextResponse.json({ error: "userId and adminId are required" }, { status: 400 });
    }

    // Verify admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Block user (add to ChatAccess = blocked)
    await prisma.chatAccess.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to block user:", error);
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }
}

// DELETE /api/chat/access - UNBLOCK user (restore access)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const adminId = searchParams.get("adminId");

    if (!userId || !adminId) {
      return NextResponse.json({ error: "userId and adminId are required" }, { status: 400 });
    }

    // Verify admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Unblock user (remove from ChatAccess)
    await prisma.chatAccess.delete({ where: { userId } }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unblock user:", error);
    return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
  }
}
