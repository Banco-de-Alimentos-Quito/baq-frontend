import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cedula } = body;

    if (!cedula) {
      return NextResponse.json(
        { message: "Cédula es requerida" },
        { status: 400 }
      );
    }

    // Mock logic to determine gestor based on cedula
    // In a real application, this would query a database

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple deterministic mock based on last digit for demo purposes
    // or just return a static one as per "BAQ-PAT" might imply.
    // However, the user asked to FIND the gestor.

    const GESTORES = ["BAQ", "DonaYa", "Redes Sociales", "Asistente 1"];

    // Use the cedula to hash or pick a gestor deterministically
    const lastDigit = parseInt(cedula.slice(-1)) || 0;
    const gestorIndex = lastDigit % GESTORES.length;
    const gestor = GESTORES[gestorIndex];

    return NextResponse.json({
      success: true,
      data: {
        cedula,
        gestor_donacion: gestor,
        last_donation_date: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}
