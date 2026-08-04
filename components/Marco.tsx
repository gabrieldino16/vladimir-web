import Image from "next/image";
import type { Foto } from "@/lib/smugmug";

/**
 * Muestra una foto de la galería. Mientras no estén conectados los álbumes de
 * SmugMug, dibuja un marco dorado de relleno con la proporción correcta, para
 * que el diseño se pueda ver y aprobar sin fotos cargadas.
 */
export function Marco({
  foto,
  etiqueta,
  className = "",
  prioridad = false,
}: {
  foto?: Foto;
  etiqueta?: string;
  className?: string;
  prioridad?: boolean;
}) {
  if (foto) {
    return (
      <Image
        src={foto.miniatura}
        alt={foto.titulo || etiqueta || "Fotografía"}
        width={foto.ancho}
        height={foto.alto}
        priority={prioridad}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-carbon via-negro-suave to-black ${className}`}
    >
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 text-dorado/35"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path d="M3 8a2 2 0 0 1 2-2h2l1.2-2h7.6L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
          <circle cx="12" cy="12.5" r="3.6" />
        </svg>
        {etiqueta && (
          <span className="text-[0.65rem] tracking-[0.3em] text-dorado/40 uppercase">
            {etiqueta}
          </span>
        )}
      </div>
    </div>
  );
}
