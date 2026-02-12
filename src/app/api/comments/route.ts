import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/comments?taskId=xxx - Get comments for a task
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: "asc" },
      take: 10, // Max 10 comments per task
    });

    return NextResponse.json(comments.map((c: any) => ({
      id: c.id,
      text: c.text,
      authorId: c.authorId,
      authorName: c.author.name,
      authorAvatar: c.author.avatar,
      createdAt: c.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/comments - Add a comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, text, authorId } = body;

    if (!taskId || !text || !authorId) {
      return NextResponse.json({ error: "taskId, text, and authorId are required" }, { status: 400 });
    }

    // Verify author exists
    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) {
      return NextResponse.json({ 
        error: "Пользователь не найден. Пожалуйста, выйдите и войдите снова." 
      }, { status: 400 });
    }

    // Get task info for activity log
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true, projectId: true },
    });

    // Check comment count for this task
    const commentCount = await prisma.comment.count({ where: { taskId } });
    
    if (commentCount >= 10) {
      // Delete oldest comment to make room
      const oldestComment = await prisma.comment.findFirst({
        where: { taskId },
        orderBy: { createdAt: "asc" }
      });
      if (oldestComment) {
        await prisma.comment.delete({ where: { id: oldestComment.id } });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        taskId,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Log activity
    if (task) {
      await prisma.activity.create({
        data: {
          type: "task",
          action: "commented",
          subject: task.title,
          targetId: taskId,
          projectId: task.projectId,
          userId: authorId,
          userName: author.name,
          userAvatar: author.avatar,
        },
      });
    }

    return NextResponse.json({
      id: comment.id,
      text: comment.text,
      authorId: comment.authorId,
      authorName: comment.author.name,
      authorAvatar: comment.author.avatar,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
