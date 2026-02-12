import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    // Check password - support both plain text (legacy) and hashed
    let passwordValid = false;
    if (user.password.startsWith("$2")) {
      // Bcrypt hash
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text (legacy - for admin created in seed)
      passwordValid = user.password === password;
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    // Check maintenance mode - only admins can login
    const settings = await prisma.systemSettings.findUnique({ where: { id: "settings" } });
    if (settings?.maintenanceMode && user.role !== "admin") {
      return NextResponse.json(
        { error: "Система в режиме обслуживания. Вход только для администраторов." },
        { status: 403 }
      );
    }

    // Update isOnline status in TeamMember (by userId or email)
    // Also link TeamMember to User if not linked yet
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (teamMember) {
      await prisma.teamMember.update({
        where: { id: teamMember.id },
        data: { 
          isOnline: true, 
          lastSeen: new Date(),
          userId: user.id, // Ensure link exists
        },
      });
    }

    // Generate JWT token for mobile app
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password) + token
    const { password: _, ...userData } = user;
    
    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        teamMemberId: teamMember?.id,
        dailyRate: teamMember?.dailyRate || 0,
        carBonus: teamMember?.carBonus || 0,
        isAdmin: teamMember?.isAdmin || user.role === "admin",
      },
      token, // JWT token for mobile app
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
