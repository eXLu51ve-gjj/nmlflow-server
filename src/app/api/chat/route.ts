import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyChatMessage } from "@/lib/push-notifications";

// GET /api/chat - Get chat messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Check if user is blocked from chat (inverted logic - by default everyone has access)
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      // Admins always have access
      if (user.role !== "admin") {
        // Check if user is BLOCKED (ChatAccess now means BLOCKED, not allowed)
        const blocked = await prisma.chatAccess.findUnique({ where: { userId } });
        if (blocked) {
          return NextResponse.json({ error: "No access to chat", hasAccess: false }, { status: 403 });
        }
      }
    }

    const messages = await prisma.chatMessage.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      messages: messages.reverse().map((m: any) => ({
        id: m.id,
        text: m.text,
        attachments: JSON.parse(m.attachments),
        authorId: m.authorId,
        authorName: m.author.name,
        authorAvatar: m.author.avatar,
        createdAt: m.createdAt.toISOString(),
      })),
      hasAccess: true,
    });
  } catch (error) {
    console.error("Failed to fetch chat messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/chat - Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, attachments, authorId } = body;

    if (!authorId) {
      return NextResponse.json({ error: "authorId is required" }, { status: 400 });
    }

    if (!text && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message must have text or attachments" }, { status: 400 });
    }

    // Verify author exists and has access
    const user = await prisma.user.findUnique({ where: { id: authorId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check access (admins always have access, others check if NOT blocked)
    if (user.role !== "admin") {
      const blocked = await prisma.chatAccess.findUnique({ where: { userId: authorId } });
      if (blocked) {
        return NextResponse.json({ error: "No access to chat" }, { status: 403 });
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        text: text || "",
        attachments: JSON.stringify(attachments || []),
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Send push notification to other users
    notifyChatMessage(authorId, message.author.name, text || '📷 Фото').catch(console.error);

    return NextResponse.json({
      id: message.id,
      text: message.text,
      attachments: JSON.parse(message.attachments),
      authorId: message.authorId,
      authorName: message.author.name,
      authorAvatar: message.author.avatar,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// DELETE /api/chat - Clear all messages (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Verify admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await prisma.chatMessage.deleteMany({});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear chat:", error);
    return NextResponse.json({ error: "Failed to clear chat" }, { status: 500 });
  }
}
