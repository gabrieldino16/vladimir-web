import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Encabezado } from "@/components/Encabezado";
import { GrillaFotos } from "@/components/GrillaFotos";
import { IconoWhatsapp } from "@/components/Iconos";
import { site, tiposDeEvento } from "@/lib/site";
import { fotosDeGaleria } from "@/lib/smugmug";

export function generateStaticParams() {
  return tiposDeEvento.map((t) => ({ categoria: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/galerias/[categoria]">): Promise<Metadata> {
  const { categoria } = await params;
  const tipo = tiposDeEvento.find((t) => t.slug === categoria);
  return { title: tipo ? tipo.nombre : "Galería" };
}

export default async function Galeria({
  params,
}: PageProps<"/galerias/[categoria]">) {
  const { categoria } = await params;
  const tipo = tiposDeEvento.find((t) => t.slug === categoria);
  if (!tipo) notFound();

  // Se traen todas: varias son secuencias de una misma sesión y cortarlas
  // a la mitad rompe la lectura.
  const fotos = await fotosDeGaleria(categoria, 300);

  return (
    <>
      <Header />
      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-6xl px-5 pb-24">
          <Encabezado volanta="Galería" titulo={tipo.nombre} />

          <div className="mt-14">
            {fotos.length > 0 ? (
              <GrillaFotos fotos={fotos} />
            ) : (
              <div className="border border-dorado/20 bg-negro-suave px-6 py-20 text-center">
                <p className="titulo text-2xl text-dorado">Muy pronto</p>
                <p className="mx-auto mt-4 max-w-md leading-relaxed text-texto-tenue">
                  Estamos cargando las fotos de esta galería. Mientras tanto,
                  podés ver los trabajos en Instagram o escribirme directamente.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <a
                    href={site.contacto.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-dorado px-7 py-3 text-sm tracking-[0.2em] text-dorado uppercase transition-colors hover:bg-dorado hover:text-negro"
                  >
                    Ver Instagram
                  </a>
                  <a
                    href={site.contacto.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-dorado px-7 py-3 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90"
                  >
                    <IconoWhatsapp className="h-4 w-4" />
                    Consultar
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/galerias"
              className="text-sm tracking-[0.2em] text-texto-tenue uppercase transition-colors hover:text-dorado"
            >
              ← Volver a galerías
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
