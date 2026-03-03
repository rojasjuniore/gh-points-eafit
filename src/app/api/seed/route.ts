import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// Seed endpoint para crear admin inicial
// GET /api/seed?secret=gh-points-2026
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "gh-points-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verificar si ya existe un admin
  const existingAdmin = await db.user.findFirst();
  if (existingAdmin) {
    return NextResponse.json({
      message: "Admin ya existe",
      email: existingAdmin.email,
    });
  }

  // Crear admin por defecto
  const hashedPassword = await hashPassword("admin123");
  const admin = await db.user.create({
    data: {
      email: "admin@oe.eafit.edu.co",
      password: hashedPassword,
      name: "Admin OE",
    },
  });

  // Crear algunos comités de ejemplo
  const comites = await Promise.all([
    db.committee.create({
      data: { name: "Comunicaciones", color: "#4cc9f0", description: "Comité de comunicaciones y redes" },
    }),
    db.committee.create({
      data: { name: "Eventos", color: "#e85d04", description: "Organización de eventos" },
    }),
    db.committee.create({
      data: { name: "Finanzas", color: "#d4a017", description: "Gestión financiera" },
    }),
    db.committee.create({
      data: { name: "Logística", color: "#22c55e", description: "Logística y operaciones" },
    }),
  ]);

  return NextResponse.json({
    message: "Seed completado",
    admin: { email: admin.email, password: "admin123" },
    comites: comites.map((c) => c.name),
  });
}
