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

/** Tipos de evento que se ofrecen (se usan en galerías, formularios y packs). */
export const tiposDeEvento = [
  { slug: "15-anios", nombre: "15 años" },
  { slug: "casamientos", nombre: "Casamientos" },
  { slug: "eventos-empresariales", nombre: "Eventos empresariales" },
] as const;

export type TipoDeEvento = (typeof tiposDeEvento)[number]["slug"];
