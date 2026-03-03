import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, description, color } = await request.json();

  const committee = await db.committee.update({
    where: { id },
    data: { name, description, color },
  });

  return NextResponse.json(committee);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.committee.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
