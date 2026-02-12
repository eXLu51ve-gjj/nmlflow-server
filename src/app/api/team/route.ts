import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all team members
export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Check lastSeen - if more than 1 minute ago, consider offline
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const membersWithStatus = members.map((m) => ({
      ...m,
      isOnline: m.isOnline && m.lastSeen && new Date(m.lastSeen) > oneMinuteAgo,
    }));

    return NextResponse.json(membersWithStatus);
  } catch (error) {
    console.error("Get team error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE team member
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        role: data.role,
        avatar: data.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        isOnline: data.isOnline || false,
        isAdmin: data.isAdmin || false,
        dailyRate: data.dailyRate || 0,
        carBonus: data.carBonus || 0,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Create team member error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
