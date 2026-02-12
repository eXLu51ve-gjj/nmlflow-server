import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email && !userId) {
      return NextResponse.json({ success: true });
    }

    // Update isOnline status in TeamMember (by userId or email)
    await prisma.teamMember.updateMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(email ? [{ email: email.toLowerCase() }] : []),
        ],
      },
      data: { isOnline: false, lastSeen: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: true });
  }
}
