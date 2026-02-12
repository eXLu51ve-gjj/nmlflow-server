import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        city: true,
        citizenship: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// PUT - update user profile
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, name, email, phone, city, citizenship, avatar } = data;

    if (!userId) {
      return NextResponse.json({ error: "userId обязателен" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(citizenship !== undefined && { citizenship }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        city: true,
        citizenship: true,
        avatar: true,
        role: true,
      },
    });

    // Also update TeamMember if exists
    const teamMember = await prisma.teamMember.findFirst({
      where: { email: updatedUser.email },
    });

    if (teamMember) {
      await prisma.teamMember.update({
        where: { id: teamMember.id },
        data: {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(avatar && { avatar }),
        },
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Ошибка обновления профиля" }, { status: 500 });
  }
}
