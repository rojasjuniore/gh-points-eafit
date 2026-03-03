import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const members = await db.member.findMany({
    include: {
      committees: {
        include: { committee: { select: { id: true, name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const { name, email, type, committeeIds } = await request.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Nombre y email requeridos" },
      { status: 400 }
    );
  }

  const member = await db.member.create({
    data: {
      name,
      email,
      type: type || "NEW",
      committees: {
        create: (committeeIds || []).map((committeeId: string) => ({
          committeeId,
        })),
      },
    },
    include: {
      committees: {
        include: { committee: { select: { id: true, name: true } } },
      },
    },
  });

  return NextResponse.json(member);
}
