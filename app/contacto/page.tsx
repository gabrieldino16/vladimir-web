import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Encabezado } from "@/components/Encabezado";
import { Formulario } from "@/components/Formulario";
import { IconoInstagram, IconoWhatsapp } from "@/components/Iconos";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Consultá disponibilidad para tu evento.",
};

export default function Contacto() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-5xl px-5 pb-24">
          <Encabezado
            volanta="Contacto"
            titulo="Hablemos de tu evento"
            bajada="Dejame tus datos y te respondo a la brevedad. Si preferís, escribime directo por WhatsApp."
          />

          <div className="mt-16 grid gap-12 md:grid-cols-[1fr_320px]">
            <Formulario />

            <aside className="space-y-8">
              <div className="border border-dorado/20 bg-negro-suave p-7">
                <h2 className="titulo mb-5 text-xl text-dorado">Directo</h2>
                <ul className="space-y-4 text-sm">
                  <li>
                    <a
                      href={site.contacto.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-texto-tenue transition-colors hover:text-dorado"
                    >
                      <IconoWhatsapp className="h-5 w-5 shrink-0" />
                      {site.contacto.whatsappTexto}
                    </a>
                  </li>
                  <li>
                    <a
                      href={site.contacto.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-texto-tenue transition-colors hover:text-dorado"
                    >
                      <IconoInstagram className="h-5 w-5 shrink-0" />@
                      {site.contacto.instagram}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="border border-dorado/20 bg-negro-suave p-7">
                <h2 className="titulo mb-3 text-xl text-dorado">Zona</h2>
                <p className="text-sm leading-relaxed text-texto-tenue">
                  {site.contacto.ciudad} y alrededores. Consultá por eventos en
                  otras ciudades.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
