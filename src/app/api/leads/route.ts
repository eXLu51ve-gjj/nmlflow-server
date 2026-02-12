import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyAllUsers } from "@/lib/push-notifications";

// GET all leads
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        assignee: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const transformed = leads.map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      email: l.email,
      phone: l.phone,
      address: l.address,
      coverImage: l.coverImage,
      value: l.value,
      status: l.status,
      avatar: l.avatar,
      assigneeId: l.assigneeId,
      history: JSON.parse(l.history),
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE lead
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
        coverImage: data.coverImage,
        value: data.value || 0,
        status: data.status || "leads",
        avatar: data.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        assigneeId: data.assigneeId,
        history: JSON.stringify([{ date: new Date().toISOString(), action: "Лид создан" }]),
      },
    });

    // Send push notification about new lead
    notifyAllUsers(null, '🆕 Новый лид', `${data.name} - ${data.company}`, { type: 'crm', leadId: lead.id }).catch(console.error);

    return NextResponse.json({
      ...lead,
      history: JSON.parse(lead.history),
      createdAt: lead.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
