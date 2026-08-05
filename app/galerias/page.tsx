import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Encabezado } from "@/components/Encabezado";
import { PortadaRotativa } from "@/components/PortadaRotativa";
import { IconoFlecha } from "@/components/Iconos";
import { columnas, tiposDeEvento } from "@/lib/site";
import {
  armarRotacion,
  fotosDeTodasLasGalerias,
  resolverPortadas,
} from "@/lib/portadas-servidor";
import { esApaisada } from "@/lib/smugmug";

export const metadata: Metadata = {
  title: "Galerías",
  description:
    "Fotografías de 15 años, casamientos y eventos empresariales por Vladimir Krauchuk.",
};

export default async function Galerias() {
  // Las portadas son las mismas que muestra el inicio: las elige el fotógrafo
  // desde el panel y, si no eligió, se buscan solas.
  const fotosPorGaleria = await fotosDeTodasLasGalerias();
  const elegidas = await resolverPortadas(fotosPorGaleria);

  // Igual que en el inicio: las galerías sin álbum cargado no se listan, y
  // cada tarjeta va cambiando de foto mientras se mira la página.
  const galerias = tiposDeEvento
    .filter((t) => (fotosPorGaleria[t.slug] ?? []).length > 0)
    .map((t) => {
      const fotos = fotosPorGaleria[t.slug] ?? [];
      const verticales = fotos.filter((f) => !esApaisada(f));
      return {
        ...t,
        rotacion: armarRotacion(
          verticales.length > 0 ? verticales : fotos,
          elegidas.galerias[t.slug],
        ),
      };
    });

  return (
    <>
      <Header />
      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-6xl px-5 pb-24">
          <Encabezado
            volanta="Portfolio"
            titulo="Galerías"
            bajada="Elegí el tipo de evento para ver los trabajos."
          />

          <div className={`mt-16 grid gap-6 ${columnas(galerias.length)}`}>
            {galerias.map((g, indice) => (
              <Link
                key={g.slug}
                href={`/galerias/${g.slug}`}
                className="group relative aspect-[3/4] overflow-hidden border border-dorado/15"
              >
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <PortadaRotativa
                    fotos={g.rotacion}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    retraso={indice * 1800}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h2 className="titulo text-2xl text-texto">{g.nombre}</h2>
                  <span className="mt-2 inline-flex items-center gap-2 text-xs tracking-[0.22em] text-dorado uppercase">
                    Ver fotos
                    <IconoFlecha className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
