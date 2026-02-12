import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        columns: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform columns name from JSON string
    const transformed = projects.map((p) => ({
      ...p,
      columns: p.columns.map((c) => ({
        ...c,
        name: JSON.parse(c.name),
      })),
      archiveSettings: {
        enabled: p.archiveEnabled,
        sourceColumnId: p.archiveSourceColumn || "",
        archiveDay: p.archiveDay,
      },
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        archiveEnabled: data.archiveSettings?.enabled || false,
        archiveSourceColumn: data.archiveSettings?.sourceColumnId,
        archiveDay: data.archiveSettings?.archiveDay || 1,
        columns: {
          create: (data.columns || []).map((col: any, index: number) => ({
            name: JSON.stringify(col.name),
            color: col.color,
            order: index,
            isArchiveColumn: col.isArchiveColumn || false,
          })),
        },
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
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
