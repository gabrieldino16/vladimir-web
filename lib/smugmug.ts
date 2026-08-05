/**
 * Lectura de galerías desde SmugMug.
 *
 * Para álbumes PÚBLICOS alcanza con una API key de sólo lectura: no hace falta
 * que el fotógrafo entregue su usuario ni pasar por OAuth. La clave se pone en
 * la variable de entorno SMUGMUG_API_KEY.
 *
 * Cada galería del sitio se asocia a uno o varios álbumes mediante una variable
 * de entorno (ver `variableDeGaleria`), donde va la clave que devuelve
 * `tools/listar-albumes.mjs`.
 *
 * Mientras no haya clave configurada, la web funciona igual y las galerías
 * muestran su estado de "muy pronto", así se puede trabajar el diseño antes de
 * conectar la cuenta.
 */

const API = "https://api.smugmug.com/api/v2";

export type Foto = {
  id: string;
  titulo: string;
  /** Versión liviana, para las grillas. */
  miniatura: string;
  /** Versión grande, para el visor. */
  grande: string;
  ancho: number;
  alto: number;
};

/**
 * La variable de entorno que guarda el álbum de una galería. Se deduce del
 * slug para que agregar un tipo de evento no obligue a tocar este archivo:
 *   "15-anios" -> SMUGMUG_ALBUM_15_ANIOS
 */
export function variableDeGaleria(slug: string) {
  return `SMUGMUG_ALBUM_${slug.toUpperCase().replace(/-/g, "_")}`;
}

/**
 * Claves de los álbumes de una galería. Puede tener varios: se escriben
 * separados por coma y las fotos se muestran mezcladas.
 */
function clavesDeGaleria(slug: string): string[] {
  const valor = process.env[variableDeGaleria(slug)] ?? "";
  return valor.split(",").map((c) => c.trim()).filter(Boolean);
}

export const hayApi = () => Boolean(process.env.SMUGMUG_API_KEY);

/**
 * Una foto apaisada llena un fondo ancho sin recortes feos; una vertical
 * queda cortada por el medio. Se usa para elegir la portada del inicio.
 */
export const esApaisada = (foto: Foto) => foto.ancho > foto.alto;

type ImagenSmugMug = {
  ImageKey: string;
  Title?: string;
  Caption?: string;
  FileName?: string;
  IsVideo?: boolean;
  ThumbnailUrl?: string;
  ArchivedUri?: string;
  OriginalWidth?: number;
  OriginalHeight?: number;
  Uris?: { ImageSizes?: { Uri: string } };
};

/**
 * Medidas que sirve el CDN de SmugMug, con el lado más largo de cada una.
 * El sufijo antes de la extensión elige cuál se descarga, así no hace falta un
 * pedido extra por foto.
 */
const MEDIDAS = [
  { clave: "M", lado: 450 },
  { clave: "L", lado: 600 },
  { clave: "XL", lado: 768 },
  { clave: "X2", lado: 960 },
  { clave: "X3", lado: 1200 },
  { clave: "X4", lado: 2048 },
  { clave: "X5", lado: 2560 },
] as const;

/**
 * La más chica que alcance para mostrarse con nitidez, sin pedir una versión
 * más grande que la foto original: esas no existen y darían un error.
 */
function medidaPara(necesario: number, ladoOriginal: number) {
  const posibles = MEDIDAS.filter((m) => m.lado <= ladoOriginal);
  if (posibles.length === 0) return MEDIDAS[0].clave;
  return (posibles.find((m) => m.lado >= necesario) ?? posibles[posibles.length - 1])
    .clave;
}

function urlEnMedida(thumbnailUrl: string, medida: string): string {
  return thumbnailUrl.replace(/\/(Th|S|M|L|XL|X2|X3)\//, `/${medida}/`)
    .replace(/-(Th|S|M|L|XL|X2|X3)\.(jpg|jpeg|png)$/i, `-${medida}.$2`);
}

async function pedir(url: string) {
  const clave = process.env.SMUGMUG_API_KEY;
  if (!clave) throw new Error("Falta SMUGMUG_API_KEY");

  const respuesta = await fetch(`${url}${url.includes("?") ? "&" : "?"}APIKey=${clave}`, {
    headers: { Accept: "application/json" },
    // Se refresca cada hora: si el fotógrafo sube fotos nuevas, aparecen solas
    // sin necesidad de volver a publicar la web.
    next: { revalidate: 3600 },
  });

  if (!respuesta.ok) {
    throw new Error(`SmugMug respondió ${respuesta.status}`);
  }
  return respuesta.json();
}

/** Trae las fotos de un álbum público de SmugMug. */
export async function fotosDelAlbum(albumKey: string, limite = 60): Promise<Foto[]> {
  const datos = await pedir(`${API}/album/${albumKey}!images?count=${limite}`);
  const imagenes: ImagenSmugMug[] = datos?.Response?.AlbumImage ?? [];

  return imagenes
    .filter((img) => !img.IsVideo && img.ThumbnailUrl)
    .map((img) => {
      const ancho = img.OriginalWidth ?? 1600;
      const alto = img.OriginalHeight ?? 1067;
      const ladoOriginal = Math.max(ancho, alto);
      return {
        id: img.ImageKey,
        titulo: img.Title || img.Caption || img.FileName || "",
        // En una grilla cada foto ocupa unos 400 px de ancho; en una pantalla
        // de alta densidad eso son 800 px reales. Como la medida se mide por el
        // lado largo, hay que pedir 1200 para que el ancho llegue a 800.
        miniatura: urlEnMedida(img.ThumbnailUrl!, medidaPara(1200, ladoOriginal)),
        // El visor y el fondo de la portada ocupan la pantalla entera.
        grande: urlEnMedida(img.ThumbnailUrl!, medidaPara(2048, ladoOriginal)),
        ancho,
        alto,
      };
    });
}

/**
 * Fotos de una galería. Si todavía no hay API key o álbum configurado,
 * devuelve una lista vacía para que la página muestre su estado de "próximamente"
 * en lugar de romperse.
 *
 * Con varios álbumes las fotos se intercalan (una de cada uno por vuelta), así
 * la grilla muestra eventos distintos desde el principio y no un álbum entero
 * seguido del siguiente.
 */
export async function fotosDeGaleria(slug: string, limite = 60): Promise<Foto[]> {
  const claves = clavesDeGaleria(slug);
  if (!hayApi() || claves.length === 0) return [];

  const porAlbum = await Promise.all(
    claves.map(async (clave) => {
      try {
        return await fotosDelAlbum(clave, limite);
      } catch (error) {
        console.error(`No se pudieron traer las fotos de "${slug}" (${clave}):`, error);
        return [];
      }
    }),
  );

  const mezcladas: Foto[] = [];
  const masLargo = Math.max(0, ...porAlbum.map((a) => a.length));
  for (let i = 0; i < masLargo && mezcladas.length < limite; i++) {
    for (const album of porAlbum) {
      if (album[i] && mezcladas.length < limite) mezcladas.push(album[i]);
    }
  }
  return mezcladas;
}
