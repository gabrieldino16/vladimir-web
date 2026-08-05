/**
 * Guardado de las portadas elegidas desde el panel.
 *
 * Al guardar se le avisa a Next que rehaga las páginas afectadas, para que el
 * cambio se vea enseguida y no dentro de una hora, que es cada cuánto se
 * refrescan solas.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { haySesion } from "@/lib/auth";
import { guardarPortadas, leerPortadas } from "@/lib/portadas-servidor";
import type { Eleccion, Portadas } from "@/lib/portadas";
import { tiposDeEvento } from "@/lib/site";

const SLUGS = tiposDeEvento.map((t) => t.slug) as string[];

function eleccionValida(valor: unknown): valor is Eleccion {
  if (!valor || typeof valor !== "object") return false;
  const e = valor as Record<string, unknown>;
  const enc = e.encuadre as Record<string, unknown> | undefined;
  return (
    typeof e.id === "string" &&
    e.id.length > 0 &&
    typeof e.galeria === "string" &&
    SLUGS.includes(e.galeria) &&
    !!enc &&
    typeof enc.x === "number" &&
    typeof enc.y === "number" &&
    enc.x >= 0 && enc.x <= 1 &&
    enc.y >= 0 && enc.y <= 1
  );
}

export async function GET() {
  if (!(await haySesion())) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  return NextResponse.json(await leerPortadas());
}

export async function PUT(pedido: Request) {
  if (!(await haySesion())) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await pedido.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const entrante = cuerpo as Partial<Portadas>;
  const portadas: Portadas = { galerias: {} };

  if (entrante.inicio !== undefined && entrante.inicio !== null) {
    if (!eleccionValida(entrante.inicio)) {
      return NextResponse.json({ error: "La portada del inicio es inválida." }, { status: 400 });
    }
    portadas.inicio = entrante.inicio;
  }

  for (const [slug, eleccion] of Object.entries(entrante.galerias ?? {})) {
    if (!SLUGS.includes(slug)) continue;
    if (eleccion === null || eleccion === undefined) continue;
    if (!eleccionValida(eleccion)) {
      return NextResponse.json(
        { error: `La portada de "${slug}" es inválida.` },
        { status: 400 },
      );
    }
    portadas.galerias[slug] = eleccion;
  }

  try {
    await guardarPortadas(portadas);
  } catch (error) {
    console.error("No se pudieron guardar las portadas:", error);
    return NextResponse.json(
      { error: "No se pudo guardar. Revisá la configuración de guardado." },
      { status: 500 },
    );
  }

  revalidatePath("/");
  revalidatePath("/galerias");

  return NextResponse.json({ ok: true });
}
