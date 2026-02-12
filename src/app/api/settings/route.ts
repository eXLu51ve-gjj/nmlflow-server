import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET system settings
export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { id: "settings" },
      });
    }

    // Get invite codes
    const inviteCodes = await prisma.inviteCode.findMany({
      where: { used: false },
      select: { code: true },
    });

    return NextResponse.json({
      ...settings,
      inviteCodes: inviteCodes.map((i) => i.code),
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// UPDATE system settings
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();

    const settings = await prisma.systemSettings.upsert({
      where: { id: "settings" },
      update: {
        registrationMode: data.registrationMode,
        requireEmailVerification: data.requireEmailVerification,
        allowPasswordReset: data.allowPasswordReset,
        sessionTimeout: data.sessionTimeout,
        maxLoginAttempts: data.maxLoginAttempts,
        maintenanceMode: data.maintenanceMode,
        salaryPayday: data.salaryPayday,
      },
      create: {
        id: "settings",
        registrationMode: data.registrationMode || "open",
        requireEmailVerification: data.requireEmailVerification || false,
        allowPasswordReset: data.allowPasswordReset ?? true,
        sessionTimeout: data.sessionTimeout || 0,
        maxLoginAttempts: data.maxLoginAttempts || 5,
        maintenanceMode: data.maintenanceMode || false,
        salaryPayday: data.salaryPayday || 1,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
