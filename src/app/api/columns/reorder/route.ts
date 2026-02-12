import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Reorder columns
export async function POST(request: NextRequest) {
  try {
    const { projectId, columnIds } = await request.json();

    if (!projectId || !columnIds || !Array.isArray(columnIds)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Update order for each column
    await Promise.all(
      columnIds.map((columnId: string, index: number) =>
        prisma.projectColumn.update({
          where: { id: columnId },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder columns error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
