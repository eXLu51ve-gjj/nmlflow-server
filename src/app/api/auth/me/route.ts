import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-middleware";

// GET /api/auth/me - Get current user from JWT token
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return unauthorizedResponse();
    }
    
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        citizenship: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return unauthorizedResponse("Пользователь не найден");
    }
    
    // Get team member info
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        dailyRate: true,
        carBonus: true,
        isAdmin: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      user: {
        ...user,
        teamMemberId: teamMember?.id,
        dailyRate: teamMember?.dailyRate || 0,
        carBonus: teamMember?.carBonus || 0,
        isAdmin: teamMember?.isAdmin || user.role === "admin",
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
