import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const events = await db.event.findMany({
    include: { _count: { select: { assignments: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const { name, description, date, pointsValue } = await request.json();

  if (!name || !date || !pointsValue) {
    return NextResponse.json(
      { error: "Nombre, fecha y puntos son requeridos" },
      { status: 400 }
    );
  }

  const event = await db.event.create({
    data: {
      name,
      description,
      date: new Date(date),
      pointsValue: parseInt(pointsValue),
    },
  });

  return NextResponse.json(event);
}
