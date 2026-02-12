import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Update lastSeen for user (heartbeat)
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId && !email) {
      return NextResponse.json({ success: false });
    }

    // Update lastSeen in TeamMember
    await prisma.teamMember.updateMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(email ? [{ email: email.toLowerCase() }] : []),
        ],
      },
      data: { lastSeen: new Date(), isOnline: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ success: false });
  }
}
