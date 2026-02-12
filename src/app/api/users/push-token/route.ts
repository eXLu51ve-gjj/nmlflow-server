import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - save push token for user
export async function POST(request: NextRequest) {
  try {
    const { userId, pushToken, notificationsEnabled } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(pushToken !== undefined && { pushToken }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      },
      select: {
        id: true,
        pushToken: true,
        notificationsEnabled: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Save push token error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
