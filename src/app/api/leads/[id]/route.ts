import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET lead by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { assignee: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Лид не найден" }, { status: 404 });
    }

    return NextResponse.json({
      ...lead,
      history: JSON.parse(lead.history),
      createdAt: lead.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// UPDATE lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Get current lead to update history
    const current = await prisma.lead.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Лид не найден" }, { status: 404 });
    }

    const currentHistory = JSON.parse(current.history);
    let newHistory = currentHistory;

    // Add history entry if status changed
    if (data.status && data.status !== current.status) {
      newHistory = [
        ...currentHistory,
        { date: new Date().toISOString(), action: `Перемещён в "${data.status}"` },
      ];
    } else if (data.historyAction) {
      newHistory = [
        ...currentHistory,
        { date: new Date().toISOString(), action: data.historyAction },
      ];
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
        coverImage: data.coverImage,
        value: data.value,
        status: data.status,
        avatar: data.avatar,
        assigneeId: data.assigneeId,
        history: JSON.stringify(newHistory),
      },
    });

    return NextResponse.json({
      ...lead,
      history: JSON.parse(lead.history),
      createdAt: lead.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
