import { NextResponse } from "next/server";
import {
  DURACION_SEGUNDOS,
  NOMBRE_COOKIE,
  armarValorCookie,
  credencialesValidas,
} from "@/lib/auth";

export async function POST(pedido: Request) {
  let datos: { usuario?: string; clave?: string };
  try {
    datos = await pedido.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const usuario = (datos.usuario || "").trim();
  const clave = datos.clave || "";

  if (!process.env.PANEL_USUARIO || !process.env.SESSION_SECRET) {
    return NextResponse.json(
      { error: "El panel no está configurado (faltan variables de entorno)." },
      { status: 500 },
    );
  }

  if (!credencialesValidas(usuario, clave)) {
    // Demora para que probar claves a lo bruto sea lento.
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(NOMBRE_COOKIE, armarValorCookie(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
  return respuesta;
}

export async function DELETE() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.delete(NOMBRE_COOKIE);
  return respuesta;
}
