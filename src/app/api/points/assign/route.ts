import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { eventId, memberIds } = await request.json();

  if (!eventId || !memberIds || memberIds.length === 0) {
    return NextResponse.json(
      { error: "Evento y miembros son requeridos" },
      { status: 400 }
    );
  }

  // Obtener el evento
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  // Obtener los miembros con sus comités
  const members = await db.member.findMany({
    where: { id: { in: memberIds } },
    include: { committees: true },
  });

  // Crear asignaciones y actualizar puntos
  let assigned = 0;
  const committeePointsMap: Record<string, number> = {};

  for (const member of members) {
    // Verificar si ya tiene asignación para este evento
    const existing = await db.pointAssignment.findUnique({
      where: {
        memberId_eventId: {
          memberId: member.id,
          eventId: event.id,
        },
      },
    });

    if (existing) continue;

    // Crear asignación
    await db.pointAssignment.create({
      data: {
        memberId: member.id,
        eventId: event.id,
        points: event.pointsValue,
      },
    });

    // Actualizar puntos del miembro
    await db.member.update({
      where: { id: member.id },
      data: { points: { increment: event.pointsValue } },
    });

    // Acumular puntos para los comités del miembro
    for (const mc of member.committees) {
      committeePointsMap[mc.committeeId] =
        (committeePointsMap[mc.committeeId] || 0) + event.pointsValue;
    }

    assigned++;
  }

  // Actualizar puntos de comités (los puntos de comité son la suma de sus miembros,
  // pero como ya actualizamos los miembros, el cálculo se hace en la query de la home)

  return NextResponse.json({
    success: true,
    assigned,
    pointsPerMember: event.pointsValue,
  });
}
