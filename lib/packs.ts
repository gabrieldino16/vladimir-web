/**
 * Packs de servicios.
 *
 * IMPORTANTE: los precios viven acá pero **no se muestran en la web pública**.
 * Sólo se usan en el panel privado, para armar los presupuestos en PDF.
 * En las páginas públicas se listan únicamente los items de cada pack.
 */

export type Item = {
  titulo: string;
  detalle: string;
};

export type Pack = {
  id: string;
  grupo: "fotografia" | "foto-video";
  nombre: string;
  /** Precio en dólares. Nunca se renderiza en páginas públicas. */
  precio: number;
  items: Item[];
};

/** Catálogo de prestaciones, para armar packs personalizados en el panel. */
export const itemsDisponibles: Record<string, Item> = {
  cobertura_foto: {
    titulo: "Cobertura de fotografía",
    detalle:
      "Servicio completo que incluye la cobertura de fotografía durante todo el evento.",
  },
  cobertura_foto_video: {
    titulo: "Cobertura de fotografía y video",
    detalle:
      "Servicio completo que incluye fotografía y grabación de video durante todo el evento, para crear un recuerdo inolvidable.",
  },
  sesion_1: {
    titulo: "1 sesión de fotos",
    detalle: "Sesión fotográfica en locación previamente seleccionada.",
  },
  sesion_2: {
    titulo: "2 sesiones de fotos",
    detalle: "Sesiones fotográficas en locaciones previamente seleccionadas.",
  },
  book_firmas: {
    titulo: "Book de firmas personalizado",
    detalle:
      "Book de firmas con hasta 30 fotos seleccionadas de las sesiones.",
  },
  video_emotivo: {
    titulo: "Video emotivo",
    detalle:
      "Un video que cuenta la historia de la quinceañera a través de sus fotos más importantes, desde sus primeros años hasta el día de su fiesta.",
  },
  edicion_vivo: {
    titulo: "Edición de fotos en vivo",
    detalle: "Se editan fotos realizadas durante la fiesta.",
  },
  backstage_video: {
    titulo: "Backstage de video en sesiones",
    detalle:
      "Cobertura de video en las sesiones, para poder proyectarla el día del evento en el momento que se elija.",
  },
  video_resumen_vivo: {
    titulo: "Edición de video resumen en vivo",
    detalle:
      "Se edita el video resumen en vivo durante la fiesta, para proyectarlo al finalizar el evento.",
  },
  book_fiesta: {
    titulo: "Book de fotos de la fiesta",
    detalle: "Book con hasta 100 fotos seleccionadas del evento.",
  },
};

const i = (clave: keyof typeof itemsDisponibles) => itemsDisponibles[clave];

export const packs: Pack[] = [
  // ---------------------------------------------------------- sólo fotografía
  {
    id: "foto-1",
    grupo: "fotografia",
    nombre: "Pack 1",
    precio: 500,
    items: [i("cobertura_foto")],
  },
  {
    id: "foto-2",
    grupo: "fotografia",
    nombre: "Pack 2",
    precio: 700,
    items: [i("sesion_1"), i("book_firmas"), i("cobertura_foto")],
  },
  {
    id: "foto-3",
    grupo: "fotografia",
    nombre: "Pack 3",
    precio: 900,
    items: [
      i("sesion_2"),
      i("book_firmas"),
      i("cobertura_foto"),
      i("edicion_vivo"),
    ],
  },

  // ------------------------------------------------------- fotografía y video
  {
    id: "video-1",
    grupo: "foto-video",
    nombre: "Pack 1",
    precio: 900,
    items: [
      i("sesion_1"),
      i("book_firmas"),
      i("video_emotivo"),
      i("cobertura_foto_video"),
    ],
  },
  {
    id: "video-2",
    grupo: "foto-video",
    nombre: "Pack 2",
    precio: 1100,
    items: [
      i("sesion_2"),
      i("book_firmas"),
      i("video_emotivo"),
      i("cobertura_foto_video"),
      i("edicion_vivo"),
    ],
  },
  {
    id: "video-3",
    grupo: "foto-video",
    nombre: "Pack 3",
    precio: 1700,
    items: [
      i("sesion_2"),
      i("backstage_video"),
      i("book_firmas"),
      i("cobertura_foto_video"),
      i("edicion_vivo"),
      i("video_resumen_vivo"),
      i("book_fiesta"),
    ],
  },
];

export const grupos = [
  {
    id: "fotografia" as const,
    nombre: "Fotografía",
    bajada: "Cobertura fotográfica del evento y sesiones previas.",
  },
  {
    id: "foto-video" as const,
    nombre: "Fotografía y Video",
    bajada: "Todo lo anterior más cobertura audiovisual y video emotivo.",
  },
];

export const packsPorGrupo = (grupo: Pack["grupo"]) =>
  packs.filter((p) => p.grupo === grupo);

export const buscarPack = (id: string) => packs.find((p) => p.id === id);
