import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Formulario } from "@/components/Formulario";
import { IconoRegalo } from "@/components/Iconos";
import { site } from "@/lib/site";

/**
 * Página del beneficio de las tarjetas personales.
 *
 * A esta dirección se llega SOLO escaneando el QR: no está enlazada desde
 * ninguna parte del sitio y se le pide a los buscadores que no la indexen, así
 * el descuento sigue siendo exclusivo de quien recibió la tarjeta.
 *
 * La ruta se define en lib/site.ts (`rutaBeneficio`). Si se cambia, hay que
 * regenerar el QR de las tarjetas.
 */
export const metadata: Metadata = {
  title: "Tu beneficio",
  robots: { index: false, follow: false },
};

export default function Beneficio() {
  return (
    <>
      <main className="flex-1">
        <section className="relative overflow-hidden px-5 pt-20 pb-16 text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-carbon via-negro-suave to-negro" />

          <div className="aparecer mx-auto max-w-2xl">
            <Logo className="mx-auto h-20 text-dorado" />

            <p className="mt-10 inline-flex items-center gap-2 border border-dorado/40 px-4 py-2 text-xs tracking-[0.3em] text-dorado uppercase">
              <IconoRegalo className="h-4 w-4" />
              Beneficio exclusivo
            </p>

            <h1 className="titulo mt-8 text-4xl font-light sm:text-5xl">
              ¡Felicitaciones!
            </h1>
            <p className="mt-3 text-sm tracking-[0.25em] text-texto-tenue uppercase">
              Acabás de desbloquear tu beneficio
            </p>

            <p className="dorado titulo mt-8 text-7xl font-bold sm:text-8xl">
              {site.beneficio.titulo}
            </p>
            <p className="mt-2 text-lg text-texto sm:text-xl">
              {site.beneficio.bajada}
            </p>

            <div className="filete mx-auto my-10 w-56" />

            <p className="mx-auto max-w-lg leading-relaxed text-texto-tenue">
              Completá tus datos y contame qué servicio te interesa. Vladimir se
              va a contactar con vos para coordinar y aplicar tu descuento.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-xl px-5 pb-24">
          <div className="border border-dorado/25 bg-negro-suave p-7 sm:p-9">
            <Formulario esBeneficio textoBoton="Reclamar mi beneficio" />
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-texto-tenue">
            Beneficio personal, válido presentando esta pantalla al momento de
            contratar. No acumulable con otras promociones.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
