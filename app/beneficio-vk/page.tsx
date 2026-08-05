import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Marco } from "@/components/Marco";
import { Formulario } from "@/components/Formulario";
import { IconoFlecha, IconoRegalo } from "@/components/Iconos";
import { site } from "@/lib/site";
import {
  automaticaDelInicio,
  fotosDeTodasLasGalerias,
  resolverPortadas,
} from "@/lib/portadas-servidor";
import { aPosicionCss } from "@/lib/portadas";

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

export default async function Beneficio() {
  // La foto de fondo la elige el fotógrafo desde el panel; si no eligió, se
  // usa una apaisada cualquiera, igual que en el inicio.
  const fotosPorGaleria = await fotosDeTodasLasGalerias();
  const elegidas = await resolverPortadas(fotosPorGaleria);
  const foto = elegidas.beneficio?.foto ?? automaticaDelInicio(fotosPorGaleria);
  const posicion = elegidas.beneficio
    ? aPosicionCss(elegidas.beneficio.encuadre)
    : undefined;
  const posicionMovil = elegidas.beneficio?.encuadreMovil
    ? aPosicionCss(elegidas.beneficio.encuadreMovil)
    : undefined;

  return (
    <>
      <main className="flex-1">
        <section className="relative overflow-hidden px-5 pt-20 pb-16 text-center">
          <div className="absolute inset-0 -z-10">
            <Marco
              foto={foto}
              conIcono={false}
              medida="grande"
              sizes="100vw"
              posicion={posicion}
              posicionMovil={posicionMovil}
              prioridad
            />
            {/* El 20% OFF va encima, así que la foto queda bien apagada: acá
                manda el mensaje, no la imagen. */}
            <div className="absolute inset-0 bg-black/65" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-negro" />
          </div>

          <div className="aparecer mx-auto max-w-2xl">
            <Logo className="sombra-logo mx-auto h-20 text-dorado" />

            <p className="mt-10 inline-flex items-center gap-2 border border-dorado/40 px-4 py-2 text-xs tracking-[0.3em] text-dorado uppercase">
              <IconoRegalo className="h-4 w-4" />
              Beneficio exclusivo
            </p>

            <h1 className="sombra-texto titulo mt-8 text-4xl font-light sm:text-5xl">
              ¡Felicitaciones!
            </h1>
            <p className="sombra-texto mt-3 text-sm tracking-[0.25em] text-texto uppercase">
              Acabás de desbloquear tu beneficio
            </p>

            <p className="dorado titulo mt-8 text-7xl font-bold sm:text-8xl">
              {site.beneficio.titulo}
            </p>
            <p className="sombra-texto mt-2 text-lg text-texto sm:text-xl">
              {site.beneficio.bajada}
            </p>

            {/* La página no tiene menú, así que este es el único camino para
                ver el trabajo antes de dejar los datos. */}
            <Link
              href="/galerias"
              className="group mt-9 inline-flex items-center justify-center gap-2 border border-dorado px-9 py-3.5 text-sm tracking-[0.2em] text-dorado uppercase transition-colors hover:bg-dorado hover:text-negro"
            >
              Ver mis trabajos
              <IconoFlecha className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <div className="filete mx-auto my-10 w-56" />

            <p className="sombra-texto mx-auto max-w-lg leading-relaxed text-texto">
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
