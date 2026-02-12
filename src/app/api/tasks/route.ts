import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyAllUsers } from "@/lib/push-notifications";

// GET all tasks (optionally filtered by projectId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
          take: 10, // Max 10 comments
        },
        assignees: {
          include: {
            member: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    // Transform to match frontend format
    const transformed = tasks.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      address: t.address,
      phone: t.phone,
      coverImage: t.coverImage,
      status: t.columnId,
      priority: t.priority,
      deadline: t.deadline,
      tags: JSON.parse(t.tags),
      attachments: JSON.parse(t.attachments),
      order: t.order,
      archivedAt: t.archivedAt?.toISOString(),
      createdAt: t.createdAt.toISOString(),
      assigneeIds: t.assignees.map((a) => a.memberId),
      comments: t.comments.map((c) => ({
        id: c.id,
        text: c.text,
        authorId: c.authorId,
        authorName: c.author.name,
        authorAvatar: c.author.avatar || "",
        createdAt: c.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE task
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        address: data.address,
        phone: data.phone,
        coverImage: data.coverImage,
        priority: data.priority,
        deadline: data.deadline,
        tags: JSON.stringify(data.tags || []),
        attachments: JSON.stringify(data.attachments || []),
        projectId: data.projectId,
        columnId: data.status || data.columnId,
        assignees: data.assigneeIds
          ? {
              create: data.assigneeIds.map((memberId: string) => ({
                memberId,
              })),
            }
          : undefined,
      },
      include: {
        comments: true,
        assignees: {
          include: { member: true },
        },
      },
    });

    // Send push notification to all users about new task
    notifyAllUsers(
      null, // notify everyone
      "Новая задача",
      task.title || task.address || "Новая задача создана",
      { taskId: task.id, projectId: task.projectId }
    ).catch(console.error); // Don't wait for notification

    return NextResponse.json({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      address: task.address,
      phone: task.phone,
      coverImage: task.coverImage,
      status: task.columnId,
      priority: task.priority,
      deadline: task.deadline,
      tags: JSON.parse(task.tags),
      attachments: JSON.parse(task.attachments),
      order: task.order,
      createdAt: task.createdAt.toISOString(),
      assigneeIds: task.assignees.map((a) => a.memberId),
      comments: [],
    });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
