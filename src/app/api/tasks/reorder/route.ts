import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - reorder tasks within a column
export async function POST(request: NextRequest) {
  try {
    const { taskIds, columnId } = await request.json();

    if (!taskIds || !Array.isArray(taskIds)) {
      return NextResponse.json({ error: "taskIds array required" }, { status: 400 });
    }

    // Update order for each task
    await Promise.all(
      taskIds.map((taskId: string, index: number) =>
        prisma.task.update({
          where: { id: taskId },
          data: { 
            order: index,
            ...(columnId ? { columnId } : {})
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder tasks error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
