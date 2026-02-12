import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET team member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Get team member error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// UPDATE team member
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        avatar: data.avatar,
        isOnline: data.isOnline,
        isAdmin: data.isAdmin,
        dailyRate: data.dailyRate,
        carBonus: data.carBonus,
        lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Update team member error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get team member to find linked user
    const member = await prisma.teamMember.findUnique({ where: { id } });
    
    if (!member) {
      return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
    }

    // Delete team member first
    await prisma.teamMember.delete({ where: { id } });

    // Also delete linked User account if exists
    if (member.userId || member.email) {
      const userId = member.userId;
      const email = member.email;

      // Find user
      const user = userId 
        ? await prisma.user.findUnique({ where: { id: userId } })
        : email 
          ? await prisma.user.findUnique({ where: { email } })
          : null;

      if (user) {
        // Delete all related records first
        await prisma.activity.deleteMany({ where: { userId: user.id } });
        await prisma.comment.deleteMany({ where: { authorId: user.id } });
        await prisma.leadComment.deleteMany({ where: { authorId: user.id } });
        await prisma.workDay.deleteMany({ where: { userId: user.id } });
        await prisma.chatMessage.deleteMany({ where: { authorId: user.id } });
        await prisma.chatAccess.deleteMany({ where: { userId: user.id } }).catch(() => {});
        await prisma.userSettings.deleteMany({ where: { userId: user.id } });

        // Now delete user
        await prisma.user.delete({ where: { id: user.id } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete team member error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
