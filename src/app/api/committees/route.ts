import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const committees = await db.committee.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(committees);
}

export async function POST(request: Request) {
  const { name, description, color } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const committee = await db.committee.create({
    data: { name, description, color },
  });

  return NextResponse.json(committee);
}
