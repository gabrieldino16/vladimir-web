/**
 * Datos del sitio en un solo lugar: contacto, redes y rutas privadas.
 * Cambiar algo acá se refleja en toda la web.
 */

export const site = {
  nombre: "Vladimir Krauchuk",
  rubro: "foto & video",
  descripcion:
    "Fotografía y video para 15 años, casamientos y eventos empresariales en Rosario y alrededores.",

  // Se completa cuando esté comprado el dominio (se usa para SEO y el email).
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://vladimirkrauchuk.com",

  contacto: {
    instagram: "vladimirkrau.ph",
    instagramUrl: "https://instagram.com/vladimirkrau.ph",
    whatsapp: "5493415783412",
    whatsappTexto: "+54 9 341 578-3412",
    whatsappUrl:
      "https://wa.me/5493415783412?text=" +
      encodeURIComponent("¡Hola Vladimir! Quería consultarte por tus servicios."),
    ciudad: "Rosario, Santa Fe",
  },

  /**
   * Dirección secreta del beneficio: es la que apunta el QR de las tarjetas.
   * No está enlazada desde ningún lado ni la indexa Google.
   * Para cambiarla, tocar acá y regenerar el QR.
   */
  rutaBeneficio: "beneficio-vk",

  beneficio: {
    titulo: "20% OFF",
    bajada: "en cualquier pack de fotografía",
  },
} as const;

/**
 * Tipos de evento que se ofrecen. Es el eje del sitio: de acá salen las
 * galerías, las opciones de los formularios y las portadas del panel.
 *
 * El álbum de SmugMug de cada uno se configura en una variable de entorno que
 * se llama igual que el slug: "15-anios" -> SMUGMUG_ALBUM_15_ANIOS.
 * Sumar un tipo nuevo es agregarlo acá y cargar su variable.
 */
export const tiposDeEvento = [
  { slug: "15-anios", nombre: "15 años" },
  { slug: "sesiones", nombre: "Sesiones" },
  { slug: "casamientos", nombre: "Casamientos" },
  { slug: "eventos-empresariales", nombre: "Eventos empresariales" },
] as const;

export type TipoDeEvento = (typeof tiposDeEvento)[number]["slug"];

/**
 * Columnas de la grilla de galerías según cuántas haya. Tailwind necesita las
 * clases escritas enteras, por eso es un mapa y no se arma con plantillas.
 */
export function columnas(cantidad: number) {
  if (cantidad <= 1) return "max-w-md mx-auto";
  if (cantidad === 2) return "sm:grid-cols-2 max-w-3xl mx-auto";
  if (cantidad === 3) return "md:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}
