import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Encabezado } from "@/components/Encabezado";
import { IconoInstagram, IconoWhatsapp } from "@/components/Iconos";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: "Conocé a Vladimir Krauchuk, fotógrafo y realizador audiovisual.",
};

export default function SobreMi() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-6xl px-5 pb-24">
          <Encabezado volanta="Quién soy" titulo="Sobre mí" />

          {/* Sin foto del fotógrafo: acá manda el texto, así que va a una sola
              columna, angosta y centrada, que es lo que mejor se lee. */}
          <div className="mx-auto mt-16 max-w-2xl">
            {/* Toda la bio con la misma tipografía, tamaño y color: es un solo
                texto y cualquier corte lo parte en dos. */}
            <div className="space-y-6 text-lg leading-relaxed text-texto-tenue">
              <p>
                ¡Hola! Soy Vladimir, tengo 24 años y soy fotógrafo de eventos,
                especializado en cumpleaños de 15.
              </p>
              <p>
                Disfruto mucho conocer personas nuevas y ser parte de esos días
                que quedan para siempre en la memoria. Me gusta trabajar de
                manera cercana, hacer que todos se sientan cómodos frente a la
                cámara y, sobre todo, que el evento se viva con naturalidad y
                mucha buena onda.
              </p>
              <p>
                Creo que las mejores fotos aparecen cuando la gente se divierte,
                se ríe y se olvida de que hay una cámara. Mi trabajo es
                acompañarlos durante todo el día para que ustedes solo se
                preocupen por disfrutar.
              </p>
              <p>
                Si llegaste hasta acá, espero poder ser parte de tu próxima
                historia. 📸✨
              </p>
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <a
                href={site.contacto.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-dorado px-7 py-3 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90"
              >
                <IconoWhatsapp className="h-4 w-4" />
                Escribime
              </a>
              <a
                href={site.contacto.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-dorado px-7 py-3 text-sm tracking-[0.2em] text-dorado uppercase transition-colors hover:bg-dorado hover:text-negro"
              >
                <IconoInstagram className="h-4 w-4" />
                Mi trabajo
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
