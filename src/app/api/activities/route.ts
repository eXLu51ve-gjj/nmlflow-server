import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const activities = await prisma.activity.findMany({
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    const transformed = activities.map((a) => ({
      id: a.id,
      type: a.type,
      action: a.action,
      subject: a.subject,
      targetId: a.targetId,
      projectId: a.projectId,
      userId: a.userId,
      userName: a.userName || a.user?.name || "",
      userAvatar: a.userAvatar || a.user?.avatar || "",
      timestamp: a.timestamp.toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get activities error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE activity
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const activity = await prisma.activity.create({
      data: {
        type: data.type,
        action: data.action,
        subject: data.subject,
        targetId: data.targetId,
        projectId: data.projectId,
        userId: data.userId,
        userName: data.userName || "",
        userAvatar: data.userAvatar || "",
      },
    });

    return NextResponse.json({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Create activity error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE all activities
export async function DELETE() {
  try {
    await prisma.activity.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear activities error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
