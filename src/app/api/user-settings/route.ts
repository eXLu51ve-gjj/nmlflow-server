import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET user settings
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          navOrder: JSON.stringify(["dashboard", "notifications", "crm", "tasks", "admin", "settings"]),
          revenueSources: JSON.stringify([{ id: "crm-default", type: "crm", fixedAmount: 0, enabled: true }]),
        },
      });
    }

    return NextResponse.json({
      ...settings,
      navOrder: JSON.parse(settings.navOrder),
      revenueSources: JSON.parse(settings.revenueSources),
    });
  } catch (error) {
    console.error("Get user settings error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// UPDATE user settings
export async function PATCH(request: NextRequest) {
  try {
    const { userId, navOrder, revenueSources } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        navOrder: navOrder ? JSON.stringify(navOrder) : undefined,
        revenueSources: revenueSources ? JSON.stringify(revenueSources) : undefined,
      },
      create: {
        userId,
        navOrder: JSON.stringify(navOrder || ["dashboard", "notifications", "crm", "tasks", "admin", "settings"]),
        revenueSources: JSON.stringify(revenueSources || [{ id: "crm-default", type: "crm", fixedAmount: 0, enabled: true }]),
      },
    });

    return NextResponse.json({
      ...settings,
      navOrder: JSON.parse(settings.navOrder),
      revenueSources: JSON.parse(settings.revenueSources),
    });
  } catch (error) {
    console.error("Update user settings error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
