import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, inviteCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Имя, email и пароль обязательны" }, { status: 400 });
    }

    // Check registration mode
    const settings = await prisma.systemSettings.findUnique({ where: { id: "settings" } });
    
    // Block registration in maintenance mode
    if (settings?.maintenanceMode) {
      return NextResponse.json({ error: "Система в режиме обслуживания. Регистрация недоступна." }, { status: 403 });
    }
    
    if (settings?.registrationMode === "closed") {
      return NextResponse.json({ error: "Регистрация закрыта" }, { status: 403 });
    }

    if (settings?.registrationMode === "invite") {
      if (!inviteCode) {
        return NextResponse.json({ error: "Требуется инвайт-код" }, { status: 400 });
      }
      
      const code = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
      if (!code || code.used) {
        return NextResponse.json({ error: "Неверный или использованный инвайт-код" }, { status: 400 });
      }
      
      // Mark code as used
      await prisma.inviteCode.update({
        where: { code: inviteCode },
        data: { used: true, usedBy: email },
      });
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: "Email уже зарегистрирован" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || "",
        password: hashedPassword,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        role: "user",
      },
    });

    // Also create team member for this user
    const teamMember = await prisma.teamMember.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || "",
        role: "Сотрудник",
        avatar: user.avatar,
        isAdmin: false,
        userId: user.id,
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    // Generate JWT token for mobile app
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        teamMemberId: teamMember.id,
        dailyRate: teamMember.dailyRate || 0,
        carBonus: teamMember.carBonus || 0,
        isAdmin: false,
      },
      token, // JWT token for mobile app
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
