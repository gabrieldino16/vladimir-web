import { NextResponse } from "next/server";
import { enviarConsulta } from "@/lib/email";

/**
 * Recibe los formularios de la web (consulta general y reclamo del beneficio)
 * y le manda el aviso por email al fotógrafo.
 */
export async function POST(pedido: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await pedido.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const texto = (clave: string) =>
    typeof datos[clave] === "string" ? (datos[clave] as string).trim() : "";

  const nombre = texto("nombre");
  const email = texto("email");

  if (!nombre || !email) {
    return NextResponse.json(
      { error: "Necesitamos al menos tu nombre y tu email." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "El email no parece válido." }, { status: 400 });
  }
  // Campo trampa: los robots de spam lo completan, las personas no lo ven.
  if (texto("web")) {
    return NextResponse.json({ ok: true });
  }

  try {
    await enviarConsulta({
      nombre,
      email,
      telefono: texto("telefono"),
      tipoEvento: texto("tipoEvento"),
      fechaEvento: texto("fechaEvento"),
      mensaje: texto("mensaje"),
      esBeneficio: datos.esBeneficio === true,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("No se pudo enviar la consulta:", error);
    return NextResponse.json(
      { error: "No pudimos enviar tu consulta. Probá por WhatsApp." },
      { status: 500 },
    );
  }
}
