import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, email, type, committeeIds } = await request.json();

  // Primero eliminar las relaciones existentes
  await db.memberCommittee.deleteMany({ where: { memberId: id } });

  // Actualizar miembro y crear nuevas relaciones
  const member = await db.member.update({
    where: { id },
    data: {
      name,
      email,
      type,
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.member.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
