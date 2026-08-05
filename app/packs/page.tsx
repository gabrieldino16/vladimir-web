import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Encabezado } from "@/components/Encabezado";
import { IconoWhatsapp } from "@/components/Iconos";
import { site } from "@/lib/site";
import { condicionDePago, formasDePago, grupos, packsPorGrupo } from "@/lib/packs";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Packs de fotografía y video para 15 años, casamientos y eventos empresariales.",
};

export default function Packs() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-6xl px-5 pb-24">
          <Encabezado
            volanta="Servicios"
            titulo="Packs"
            bajada="Cada evento es distinto: estos son los packs base y también armamos combinaciones a medida."
          />

          {grupos.map((grupo) => (
            <section key={grupo.id} className="mt-20">
              <div className="text-center">
                <h2 className="titulo dorado text-3xl sm:text-4xl">{grupo.nombre}</h2>
                <p className="mt-3 text-texto-tenue">{grupo.bajada}</p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {packsPorGrupo(grupo.id).map((pack, indice) => (
                  <article
                    key={pack.id}
                    className={`flex flex-col border bg-negro-suave p-8 transition-colors ${
                      indice === 1
                        ? "border-dorado/60"
                        : "border-dorado/15 hover:border-dorado/40"
                    }`}
                  >
                    <h3 className="titulo text-2xl text-texto">{pack.nombre}</h3>
                    <div className="filete my-5" />

                    <ul className="flex-1 space-y-5">
                      {pack.items.map((item) => (
                        <li key={item.titulo}>
                          <p className="flex gap-2 text-sm font-medium tracking-wide text-dorado uppercase">
                            <span aria-hidden>◆</span>
                            {item.titulo}
                          </p>
                          <p className="mt-1.5 pl-5 text-sm leading-relaxed text-texto-tenue">
                            {item.detalle}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={`https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(
                        `¡Hola Vladimir! Me interesa el ${pack.nombre} de ${grupo.nombre}.`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex items-center justify-center gap-2 border border-dorado px-6 py-3 text-xs tracking-[0.2em] text-dorado uppercase transition-colors hover:bg-dorado hover:text-negro"
                    >
                      <IconoWhatsapp className="h-4 w-4" />
                      Consultar precio
                    </a>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* ------------------------------------------------ formas de pago */}
          <section className="mt-24">
            <Encabezado
              volanta="Formas de pago"
              titulo="Cómo se abona"
              bajada="Dos maneras de contratar, según lo que te convenga."
            />

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {formasDePago.map((forma) => (
                <div
                  key={forma.titulo}
                  className="border border-dorado/20 bg-negro-suave p-8 transition-colors hover:border-dorado/50"
                >
                  <h3 className="titulo dorado text-2xl">{forma.titulo}</h3>
                  <p className="mt-4 leading-relaxed text-texto-tenue">
                    {forma.detalle}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-8 border-l-2 border-dorado px-5 py-1 text-sm leading-relaxed text-texto-tenue">
              {condicionDePago}
            </p>
          </section>

          <div className="mt-20 border border-dorado/20 bg-negro-suave px-6 py-14 text-center">
            <h2 className="titulo text-3xl">¿Necesitás algo distinto?</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-texto-tenue">
              Armamos un pack personalizado combinando los servicios que
              necesites para tu evento.
            </p>
            <a
              href={site.contacto.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 bg-dorado px-9 py-3.5 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90"
            >
              <IconoWhatsapp className="h-4 w-4" />
              Pedir presupuesto
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
