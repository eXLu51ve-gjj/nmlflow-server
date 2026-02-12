import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
    }

    return NextResponse.json({
      ...project,
      columns: project.columns.map((c) => ({
        ...c,
        name: JSON.parse(c.name),
      })),
      archiveSettings: {
        enabled: project.archiveEnabled,
        sourceColumnId: project.archiveSourceColumn || "",
        archiveDay: project.archiveDay,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// UPDATE project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        archiveEnabled: data.archiveSettings?.enabled,
        archiveSourceColumn: data.archiveSettings?.sourceColumnId,
        archiveDay: data.archiveSettings?.archiveDay,
      },
      include: {
        columns: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      ...project,
      columns: project.columns.map((c) => ({
        ...c,
        name: JSON.parse(c.name),
      })),
      archiveSettings: {
        enabled: project.archiveEnabled,
        sourceColumnId: project.archiveSourceColumn || "",
        archiveDay: project.archiveDay,
      },
    });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
