import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// UPDATE calendar note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const note = await prisma.calendarNote.update({
      where: { id },
      data: {
        text: data.text,
        attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
      },
    });

    return NextResponse.json({
      ...note,
      attachments: JSON.parse(note.attachments),
    });
  } catch (error) {
    console.error("Update calendar note error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE calendar note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.calendarNote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete calendar note error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
