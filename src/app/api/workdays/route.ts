import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET work days (optionally filtered by memberId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let where: any = {};
    if (memberId) where.memberId = memberId;

    // Filter by month/year if provided
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
      
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const workDays = await prisma.workDay.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(workDays);
  } catch (error) {
    console.error("Get work days error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// CREATE or UPDATE work day
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const workDay = await prisma.workDay.upsert({
      where: {
        memberId_date: {
          memberId: data.memberId,
          date: data.date,
        },
      },
      update: {
        withCar: data.withCar ?? false,
        isDouble: data.isDouble ?? false,
      },
      create: {
        memberId: data.memberId,
        date: data.date,
        withCar: data.withCar ?? false,
        isDouble: data.isDouble ?? false,
        userId: data.userId,
      },
    });

    return NextResponse.json(workDay);
  } catch (error) {
    console.error("Create work day error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE work day
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const date = searchParams.get("date");

    if (!memberId || !date) {
      return NextResponse.json({ error: "memberId и date обязательны" }, { status: 400 });
    }

    await prisma.workDay.delete({
      where: {
        memberId_date: {
          memberId,
          date,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete work day error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
