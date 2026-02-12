import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH - Update column
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = JSON.stringify(data.name);
    if (data.color !== undefined) updateData.color = data.color;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isArchiveColumn !== undefined) updateData.isArchiveColumn = data.isArchiveColumn;

    const column = await prisma.projectColumn.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...column,
      name: JSON.parse(column.name),
    });
  } catch (error) {
    console.error("Update column error:", error);
    return NextResponse.json({ error: "Failed to update column" }, { status: 500 });
  }
}

// DELETE - Delete column
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get column to find project and first other column
    const column = await prisma.projectColumn.findUnique({ where: { id } });
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Find another column to move tasks to
    const otherColumn = await prisma.projectColumn.findFirst({
      where: { projectId: column.projectId, id: { not: id } },
      orderBy: { order: "asc" },
    });

    if (!otherColumn) {
      return NextResponse.json({ error: "Cannot delete last column" }, { status: 400 });
    }

    // Move tasks to other column
    await prisma.task.updateMany({
      where: { columnId: id },
      data: { columnId: otherColumn.id },
    });

    // Delete column
    await prisma.projectColumn.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete column error:", error);
    return NextResponse.json({ error: "Failed to delete column" }, { status: 500 });
  }
}
