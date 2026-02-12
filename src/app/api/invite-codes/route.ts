import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all invite codes
export async function GET() {
  try {
    const codes = await prisma.inviteCode.findMany({
      where: { used: false },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(codes.map((c) => c.code));
  } catch (error) {
    console.error("Get invite codes error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE invite code
export async function POST() {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await prisma.inviteCode.create({
      data: { code },
    });

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Create invite code error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE invite code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Код обязателен" }, { status: 400 });
    }

    await prisma.inviteCode.delete({
      where: { code },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete invite code error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
