"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Foto } from "@/lib/smugmug";

/**
 * Grilla de fotos con visor a pantalla completa.
 * Se navega con las flechas del teclado y se cierra con Escape.
 */
export function GrillaFotos({ fotos }: { fotos: Foto[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);

  // Cuantas columnas entran. Hace falta saberlo acá y no sólo en el CSS,
  // porque el reparto de las fotos depende de la cantidad.
  const [columnas, setColumnas] = useState(3);

  useEffect(() => {
    const anchoSuficiente = window.matchMedia("(min-width: 768px)");
    const aplicar = () => setColumnas(anchoSuficiente.matches ? 3 : 2);
    aplicar();
    anchoSuficiente.addEventListener("change", aplicar);
    return () => anchoSuficiente.removeEventListener("change", aplicar);
  }, []);

  /**
   * Reparte las fotos en columnas siguiendo el orden del álbum: cada una va a
   * la columna que quedó más corta hasta ese momento.
   *
   * Así las filas quedan casi alineadas —la 1, 2 y 3 arriba— sin los huecos
   * que deja una grilla pareja, porque cada columna se rellena sola. Para
   * medir el alto alcanza con la proporción de cada foto: todas las columnas
   * tienen el mismo ancho.
   */
  const repartidas = useMemo(() => {
    const columnasDeFotos: { foto: Foto; indice: number }[][] = Array.from(
      { length: columnas },
      () => [],
    );
    const alto = new Array(columnas).fill(0);

    // Dos columnas casi iguales cuentan como empatadas, y un empate lo gana la
    // de más a la izquierda, que es la que sigue en el orden de lectura. Sin
    // esta holgura, dos fotos de la misma proporción pero distinto tamaño
    // (3521x5282 da 1,50014 y 2500x1667 da 1,49970) se leen como columnas de
    // alto distinto y la foto se va a la derecha, salteándose el orden.
    const HOLGURA = 0.02; // ~2% del alto de una foto

    fotos.forEach((foto, indice) => {
      const masCorta = Math.min(...alto);
      const elegida = alto.findIndex((h) => h <= masCorta + HOLGURA);

      columnasDeFotos[elegida].push({ foto, indice });
      alto[elegida] += foto.alto / foto.ancho;
    });

    return columnasDeFotos;
  }, [fotos, columnas]);

  const mover = useCallback(
    (paso: number) =>
      setAbierta((i) =>
        i === null ? null : (i + paso + fotos.length) % fotos.length,
      ),
    [fotos.length],
  );

  useEffect(() => {
    if (abierta === null) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(null);
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", alTeclear);
    // Evita que la página de atrás se desplace mientras el visor está abierto.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, [abierta, mover]);

  return (
    <>
      {/* Las columnas se arman acá y no con columns-2 de CSS: ese modo llena
          cada columna de arriba abajo, así que la segunda foto caía debajo de
          la primera en vez de al lado y se perdía el orden del álbum. */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}
      >
        {repartidas.map((columna, numero) => (
          <div key={numero} className="flex flex-col gap-4">
            {columna.map(({ foto, indice }) => (
              <button
                key={foto.id}
                type="button"
                onClick={() => setAbierta(indice)}
                className="group relative block w-full overflow-hidden border border-transparent transition-colors hover:border-dorado/40"
                aria-label={`Ampliar ${foto.titulo || `foto ${indice + 1}`}`}
              >
                <Image
                  src={foto.miniatura}
                  alt={foto.titulo || `Fotografía ${indice + 1}`}
                  width={foto.ancho}
                  height={foto.alto}
                  className="w-full transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

                {/* En los videos se muestra la portada del video y se avisa que
                    se puede reproducir. */}
                {foto.video && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dorado/80 bg-black/50 backdrop-blur transition-transform group-hover:scale-110">
                      <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-dorado">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {abierta !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setAbierta(null)}
        >
          <button
            type="button"
            onClick={() => setAbierta(null)}
            className="absolute top-5 right-5 text-dorado transition-opacity hover:opacity-70"
            aria-label="Cerrar"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <Flecha lado="izq" onClick={() => mover(-1)} />
          <Flecha lado="der" onClick={() => mover(1)} />

          {fotos[abierta].video ? (
            /* El archivo se baja recién cuando la persona le da play: son
               videos largos y pesados, no se pueden cargar de entrada. */
            <video
              key={fotos[abierta].id}
              src={fotos[abierta].video}
              poster={fotos[abierta].grande}
              controls
              autoPlay
              preload="none"
              playsInline
              className="max-h-[88vh] w-auto"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Image
              src={fotos[abierta].grande}
              alt={fotos[abierta].titulo || "Fotografía"}
              width={fotos[abierta].ancho}
              height={fotos[abierta].alto}
              className="max-h-[88vh] w-auto object-contain"
              sizes="(max-width: 1024px) 100vw, 85vw"
              onClick={(e) => e.stopPropagation()}
              priority
            />
          )}

          <span className="absolute bottom-5 text-xs tracking-[0.3em] text-texto-tenue">
            {abierta + 1} / {fotos.length}
          </span>
        </div>
      )}
    </>
  );
}

function Flecha({ lado, onClick }: { lado: "izq" | "der"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 -translate-y-1/2 text-dorado transition-opacity hover:opacity-70 ${
        lado === "izq" ? "left-3 sm:left-8" : "right-3 sm:right-8"
      }`}
      aria-label={lado === "izq" ? "Foto anterior" : "Foto siguiente"}
    >
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
        <path d={lado === "izq" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}
