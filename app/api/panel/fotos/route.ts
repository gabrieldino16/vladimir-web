/**
 * Fotos para la portada del presupuesto (sólo con sesión abierta en el panel).
 *
 * Dos usos:
 *   ?galeria=15-anios   -> lista de fotos de esa galería, para elegir una.
 *   ?imagen=<url>       -> esa foto convertida a "data URL".
 *
 * El segundo hace falta porque el PDF se arma en el navegador: si la foto se
 * bajara directo del CDN de SmugMug, el navegador la marcaría como de otro
 * dominio y no dejaría usarla. Bajándola acá llega como si fuera propia.
 */
import { NextResponse } from "next/server";
import { haySesion } from "@/lib/auth";
import { fotosDeGaleria } from "@/lib/smugmug";

/** Único dominio del que se aceptan descargas: no es un proxy abierto. */
const DOMINIO_PERMITIDO = "photos.smugmug.com";

/** Tope de descarga, para no quedarse esperando un archivo enorme. */
const MAXIMO_BYTES = 12 * 1024 * 1024;

export async function GET(pedido: Request) {
  if (!(await haySesion())) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  const parametros = new URL(pedido.url).searchParams;
  const galeria = parametros.get("galeria");
  const imagen = parametros.get("imagen");

  if (galeria) {
    const fotos = await fotosDeGaleria(galeria, 24);
    return NextResponse.json({
      fotos: fotos.map((f) => ({ id: f.id, miniatura: f.miniatura, grande: f.grande })),
    });
  }

  if (imagen) {
    let url: URL;
    try {
      url = new URL(imagen);
    } catch {
      return NextResponse.json({ error: "Dirección inválida." }, { status: 400 });
    }
    if (url.protocol !== "https:" || url.hostname !== DOMINIO_PERMITIDO) {
      return NextResponse.json({ error: "Dominio no permitido." }, { status: 400 });
    }

    const respuesta = await fetch(url, { cache: "no-store" });
    if (!respuesta.ok) {
      return NextResponse.json(
        { error: `No se pudo bajar la foto (${respuesta.status}).` },
        { status: 502 },
      );
    }

    const tipo = respuesta.headers.get("content-type") ?? "";
    if (!tipo.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo no es una imagen." }, { status: 400 });
    }

    const datos = Buffer.from(await respuesta.arrayBuffer());
    if (datos.byteLength > MAXIMO_BYTES) {
      return NextResponse.json({ error: "La foto pesa demasiado." }, { status: 413 });
    }

    return NextResponse.json({
      dataUrl: `data:${tipo};base64,${datos.toString("base64")}`,
    });
  }

  return NextResponse.json({ error: "Falta 'galeria' o 'imagen'." }, { status: 400 });
}
