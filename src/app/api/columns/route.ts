import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Create column
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { projectId, name, color, order, isArchiveColumn } = data;

    if (!projectId || !name) {
      return NextResponse.json({ error: "projectId and name are required" }, { status: 400 });
    }

    // Get max order for this project
    const maxOrder = await prisma.projectColumn.aggregate({
      where: { projectId },
      _max: { order: true },
    });

    const column = await prisma.projectColumn.create({
      data: {
        projectId,
        name: JSON.stringify(name),
        color: color || "from-slate-500 to-slate-600",
        order: order ?? (maxOrder._max.order ?? -1) + 1,
        isArchiveColumn: isArchiveColumn || false,
      },
    });

    return NextResponse.json({
      ...column,
      name: JSON.parse(column.name),
    });
  } catch (error) {
    console.error("Create column error:", error);
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 });
  }
}
