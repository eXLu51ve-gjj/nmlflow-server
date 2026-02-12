import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all calendar notes
export async function GET() {
  try {
    const notes = await prisma.calendarNote.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json(notes.map(n => ({
      ...n,
      attachments: JSON.parse(n.attachments),
    })));
  } catch (error) {
    console.error("Get calendar notes error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE calendar note
export async function POST(request: NextRequest) {
  try {
    const { date, text, attachments } = await request.json();

    if (!date || !text) {
      return NextResponse.json({ error: "Date and text required" }, { status: 400 });
    }

    const note = await prisma.calendarNote.create({
      data: {
        date,
        text,
        attachments: JSON.stringify(attachments || []),
      },
    });

    return NextResponse.json({
      ...note,
      attachments: JSON.parse(note.attachments),
    });
  } catch (error) {
    console.error("Create calendar note error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
