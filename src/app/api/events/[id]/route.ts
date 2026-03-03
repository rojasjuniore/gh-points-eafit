import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, description, date, pointsValue, isActive } = await request.json();

  const event = await db.event.update({
    where: { id },
    data: {
      name,
      description,
      date: date ? new Date(date) : undefined,
      pointsValue: pointsValue ? parseInt(pointsValue) : undefined,
      isActive,
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
