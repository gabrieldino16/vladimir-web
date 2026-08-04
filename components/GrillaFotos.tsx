"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Foto } from "@/lib/smugmug";

/**
 * Grilla de fotos con visor a pantalla completa.
 * Se navega con las flechas del teclado y se cierra con Escape.
 */
export function GrillaFotos({ fotos }: { fotos: Foto[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);

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
      <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
        {fotos.map((foto, i) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => setAbierta(i)}
            className="group relative block w-full overflow-hidden border border-transparent transition-colors hover:border-dorado/40"
            aria-label={`Ampliar ${foto.titulo || `foto ${i + 1}`}`}
          >
            <Image
              src={foto.miniatura}
              alt={foto.titulo || `Fotografía ${i + 1}`}
              width={foto.ancho}
              height={foto.alto}
              className="w-full transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
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
