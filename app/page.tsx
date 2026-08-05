import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Encabezado } from "@/components/Encabezado";
import { Logo } from "@/components/Logo";
import { PortadaRotativa } from "@/components/PortadaRotativa";
import { IconoFlecha, IconoInstagram, IconoWhatsapp } from "@/components/Iconos";
import { columnas, site, tiposDeEvento } from "@/lib/site";
import { grupos } from "@/lib/packs";
import {
  armarRotacion,
  fotosDeTodasLasGalerias,
  resolverPortadas,
} from "@/lib/portadas-servidor";
import { esApaisada } from "@/lib/smugmug";

export default async function Inicio() {
  // Vacío mientras no haya API key: la web funciona igual.
  const fotosPorGaleria = await fotosDeTodasLasGalerias();
  const elegidas = await resolverPortadas(fotosPorGaleria);

  // Las portadas van cambiando de foto mientras se mira la página. La que
  // eligió el fotógrafo abre la rotación; las demás salen del mismo álbum.
  //
  // Las galerías que todavía no tienen álbum cargado no se muestran: una
  // tarjeta vacía hace ver la web a medio terminar. Vuelven solas en cuanto
  // se les carga el álbum.
  const destacadas = tiposDeEvento
    .filter((t) => (fotosPorGaleria[t.slug] ?? []).length > 0)
    .map((t) => {
      const fotos = fotosPorGaleria[t.slug] ?? [];
      // El recuadro es vertical, así que se prefieren fotos verticales.
      const verticales = fotos.filter((f) => !esApaisada(f));
      return {
        ...t,
        rotacion: armarRotacion(
          verticales.length > 0 ? verticales : fotos,
          elegidas.galerias[t.slug],
        ),
      };
    });

  // El fondo de la portada es ancho: se usan apaisadas, porque una vertical
  // queda recortada por el medio.
  const apaisadas = Object.values(fotosPorGaleria).flat().filter(esApaisada);
  const rotacionPortada = armarRotacion(apaisadas, elegidas.inicio);

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ---------------------------------------------------------- portada */}
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            {/* Sin álbumes conectados la lista viene vacía y queda sólo el
                fondo negro, sin ícono de relleno. */}
            <PortadaRotativa
              fotos={rotacionPortada}
              medida="grande"
              sizes="100vw"
              intervalo={7000}
            />
            {/* Dos capas: un velo parejo que asegura contraste con cualquier
                foto, y el degradado que cierra contra el fondo de la página. */}
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-negro" />
          </div>

          <div className="aparecer flex flex-col items-center px-5 text-center">
            {/* El isologo ya trae el nombre, así que no se repite como texto.
                El h1 queda igual para buscadores y lectores de pantalla. */}
            <Logo className="sombra-logo h-40 sm:h-52" conNombre />
            <h1 className="sr-only">Vladimir Krauchuk — Fotografía y video</h1>

            <p className="sombra-texto mt-5 text-xs tracking-[0.55em] text-texto sm:text-sm">
              FOTO &amp; VIDEO
            </p>

            <div className="filete my-9 w-56" />

            <p className="sombra-texto max-w-2xl text-base leading-relaxed text-texto sm:text-lg">
              Creo que las mejores fotos aparecen cuando la gente se divierte,
              se ríe y se olvida de que hay una cámara. Mi trabajo es
              acompañarlos durante todo el día para que ustedes solo se
              preocupen por disfrutar.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/galerias"
                className="group inline-flex items-center justify-center gap-2 border border-dorado px-9 py-3.5 text-sm tracking-[0.2em] text-dorado uppercase transition-colors hover:bg-dorado hover:text-negro"
              >
                Ver galerías
                <IconoFlecha className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={site.contacto.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-dorado px-9 py-3.5 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90"
              >
                <IconoWhatsapp className="h-4 w-4" />
                Consultar fecha
              </a>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- galerías */}
        <section className="mx-auto max-w-6xl px-5 py-24">
          <Encabezado
            volanta="Portfolio"
            titulo="Cada evento, su historia"
            bajada="Una selección de trabajos recientes."
          />

          {/* Las columnas siguen a la cantidad de galerías: con tres fijas y
              solo dos cargadas quedaba un hueco al costado. */}
          <div className={`mt-14 grid gap-6 ${columnas(destacadas.length)}`}>
            {destacadas.map((g, indice) => (
              <Link
                key={g.slug}
                href={`/galerias/${g.slug}`}
                className="group relative aspect-[3/4] overflow-hidden border border-dorado/15"
              >
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  {/* El desfase evita que las tarjetas cambien todas juntas. */}
                  <PortadaRotativa
                    fotos={g.rotacion}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    retraso={indice * 1800}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="titulo text-2xl text-texto">{g.nombre}</h3>
                  <span className="mt-2 inline-flex items-center gap-2 text-xs tracking-[0.22em] text-dorado uppercase">
                    Ver galería
                    <IconoFlecha className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------- servicios */}
        <section className="border-y border-dorado/15 bg-negro-suave">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <Encabezado
              volanta="Servicios"
              titulo="Packs a medida de tu evento"
              bajada="Desde la cobertura fotográfica hasta la producción audiovisual completa."
            />

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {grupos.map((g) => (
                <div
                  key={g.id}
                  className="border border-dorado/20 bg-negro p-9 transition-colors hover:border-dorado/50"
                >
                  <h3 className="titulo dorado text-3xl">{g.nombre}</h3>
                  <p className="mt-4 leading-relaxed text-texto-tenue">{g.bajada}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/packs"
                className="group inline-flex items-center gap-2 border border-dorado px-9 py-3.5 text-sm tracking-[0.2em] text-dorado uppercase transition-colors hover:bg-dorado hover:text-negro"
              >
                Ver todos los servicios
                <IconoFlecha className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- contacto */}
        <section className="mx-auto max-w-3xl px-5 py-24 text-center">
          <Encabezado
            volanta="Contacto"
            titulo="¿Tenés fecha?"
            bajada="Contame de tu evento y armamos juntos la cobertura ideal."
          />

          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={site.contacto.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-dorado px-9 py-3.5 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90"
            >
              <IconoWhatsapp className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={site.contacto.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-dorado px-9 py-3.5 text-sm tracking-[0.2em] text-dorado uppercase transition-colors hover:bg-dorado hover:text-negro"
            >
              <IconoInstagram className="h-4 w-4" />
              Instagram
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
