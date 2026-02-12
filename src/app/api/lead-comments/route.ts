import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET comments for a lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }

    const comments = await prisma.leadComment.findMany({
      where: { leadId },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const transformed = comments.map((c) => ({
      id: c.id,
      text: c.text,
      authorId: c.authorId,
      authorName: c.author.name,
      authorAvatar: c.author.avatar,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get lead comments error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE comment
export async function POST(request: NextRequest) {
  try {
    const { leadId, text, authorId } = await request.json();

    if (!leadId || !text || !authorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const comment = await prisma.leadComment.create({
      data: {
        leadId,
        text,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      id: comment.id,
      text: comment.text,
      authorId: comment.authorId,
      authorName: comment.author.name,
      authorAvatar: comment.author.avatar,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create lead comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
