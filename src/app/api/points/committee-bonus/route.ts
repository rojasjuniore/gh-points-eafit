import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { committeeId, points, reason } = await request.json();

  if (!committeeId || !points || !reason) {
    return NextResponse.json(
      { error: "Comité, puntos y razón son requeridos" },
      { status: 400 }
    );
  }

  // Verificar que el comité existe
  const committee = await db.committee.findUnique({ where: { id: committeeId } });
  if (!committee) {
    return NextResponse.json({ error: "Comité no encontrado" }, { status: 404 });
  }

  // Registrar el bonus
  await db.committeeBonus.create({
    data: {
      committeeId,
      points: parseInt(points),
      reason,
    },
  });

  // Actualizar puntos directos del comité
  await db.committee.update({
    where: { id: committeeId },
    data: { points: { increment: parseInt(points) } },
  });

  return NextResponse.json({
    success: true,
    committee: committee.name,
    points: parseInt(points),
  });
}
