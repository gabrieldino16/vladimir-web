import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Encabezado } from "@/components/Encabezado";
import { Marco } from "@/components/Marco";
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

          <div className="mt-16 grid items-center gap-12 md:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden border border-dorado/20">
              {/* TODO: reemplazar por una foto del fotógrafo. */}
              <Marco etiqueta="Vladimir Krauchuk" />
            </div>

            <div className="space-y-5 leading-relaxed text-texto-tenue">
              <p className="titulo text-3xl leading-snug text-texto">
                Contar historias que se puedan volver a mirar.
              </p>
              <p>
                Soy Vladimir Krauchuk, fotógrafo y realizador audiovisual en{" "}
                {site.contacto.ciudad}. Me dedico a cubrir los momentos que una
                familia va a querer recordar toda la vida: los 15, el casamiento,
                el evento que costó meses de trabajo.
              </p>
              <p>
                Trabajo con una mirada documental y cuidada a la vez: busco la
                emoción real del momento, sin poses forzadas, pero con una
                estética trabajada en cada detalle, desde la luz hasta la
                edición final.
              </p>
              <p>
                Acompaño todo el proceso, desde la sesión previa en la locación
                que elijas hasta la entrega del material editado, para que solo
                tengas que ocuparte de disfrutar tu día.
              </p>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
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
        </div>
      </main>
      <Footer />
    </>
  );
}
