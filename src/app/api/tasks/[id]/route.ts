import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to create activity log
async function logActivity(data: {
  type: string;
  action: string;
  subject: string;
  targetId?: string;
  projectId?: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
}) {
  try {
    await prisma.activity.create({
      data: {
        type: data.type,
        action: data.action,
        subject: data.subject,
        targetId: data.targetId,
        projectId: data.projectId,
        userId: data.userId,
        userName: data.userName || "",
        userAvatar: data.userAvatar || "",
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// GET task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        comments: {
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        assignees: {
          include: { member: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

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
      archivedAt: task.archivedAt?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      assigneeIds: task.assignees.map((a: { memberId: string }) => a.memberId),
      comments: task.comments.map((c: { id: string; text: string; authorId: string; author: { name: string }; createdAt: Date }) => ({
        id: c.id,
        text: c.text,
        authorId: c.authorId,
        authorName: c.author.name,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// UPDATE task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Get current task to compare changes
    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: { column: true, project: true },
    });

    if (!currentTask) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    // Update assignees if provided
    if (data.assigneeIds !== undefined) {
      await prisma.taskAssignee.deleteMany({ where: { taskId: id } });
      if (data.assigneeIds.length > 0) {
        await prisma.taskAssignee.createMany({
          data: data.assigneeIds.map((memberId: string) => ({
            taskId: id,
            memberId,
          })),
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        address: data.address,
        phone: data.phone,
        coverImage: data.coverImage,
        priority: data.priority,
        deadline: data.deadline,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
        columnId: data.status || data.columnId,
        archivedAt: data.archivedAt ? new Date(data.archivedAt) : undefined,
      },
      include: {
        comments: {
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        },
        assignees: {
          include: { member: true },
        },
        column: true,
        project: true,
      },
    });

    // Log activity if status changed
    const newColumnId = data.status || data.columnId;
    if (newColumnId && newColumnId !== currentTask.columnId) {
      // Get column names
      const oldColumn = currentTask.column;
      const newColumn = task.column;
      
      let oldColumnName = "Неизвестно";
      let newColumnName = "Неизвестно";
      
      try {
        if (oldColumn?.name) {
          const parsed = JSON.parse(oldColumn.name);
          oldColumnName = parsed.ru || oldColumn.name;
        }
      } catch { oldColumnName = oldColumn?.name || "Неизвестно"; }
      
      try {
        if (newColumn?.name) {
          const parsed = JSON.parse(newColumn.name);
          newColumnName = parsed.ru || newColumn.name;
        }
      } catch { newColumnName = newColumn?.name || "Неизвестно"; }

      // Get user info from request header or data
      const userId = data.userId || "system";
      let userName = data.userName || "";
      let userAvatar = data.userAvatar || "";

      // Try to get user info if userId provided
      if (userId !== "system" && !userName) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, avatar: true },
        });
        if (user) {
          userName = user.name;
          userAvatar = user.avatar;
        }
      }

      await logActivity({
        type: "task",
        action: "moved",
        subject: `${task.title} (${oldColumnName} → ${newColumnName})`,
        targetId: task.id,
        projectId: task.projectId,
        userId,
        userName,
        userAvatar,
      });
    }

    // Log if task was updated (other fields)
    if (data.title !== undefined || data.description !== undefined || data.attachments !== undefined) {
      const userId = data.userId || "system";
      let userName = data.userName || "";
      let userAvatar = data.userAvatar || "";

      if (userId !== "system" && !userName) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, avatar: true },
        });
        if (user) {
          userName = user.name;
          userAvatar = user.avatar;
        }
      }

      // Only log if not already logged as moved
      if (!newColumnId || newColumnId === currentTask.columnId) {
        await logActivity({
          type: "task",
          action: "updated",
          subject: task.title,
          targetId: task.id,
          projectId: task.projectId,
          userId,
          userName,
          userAvatar,
        });
      }
    }

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
      archivedAt: task.archivedAt?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      assigneeIds: task.assignees.map((a: { memberId: string }) => a.memberId),
      comments: task.comments.map((c: { id: string; text: string; authorId: string; author: { name: string }; createdAt: Date }) => ({
        id: c.id,
        text: c.text,
        authorId: c.authorId,
        authorName: c.author.name,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get task info before deleting
    const task = await prisma.task.findUnique({
      where: { id },
      select: { title: true, projectId: true },
    });

    await prisma.task.delete({ where: { id } });

    // Log deletion
    if (task) {
      // Try to get userId from query params or body
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId") || "system";
      
      let userName = "";
      let userAvatar = "";
      
      if (userId !== "system") {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, avatar: true },
        });
        if (user) {
          userName = user.name;
          userAvatar = user.avatar;
        }
      }

      await logActivity({
        type: "task",
        action: "deleted",
        subject: task.title,
        targetId: id,
        projectId: task.projectId,
        userId,
        userName,
        userAvatar,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
