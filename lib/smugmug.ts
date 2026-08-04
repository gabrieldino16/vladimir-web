/**
 * Lectura de galerías desde SmugMug.
 *
 * Para álbumes PÚBLICOS alcanza con una API key de sólo lectura: no hace falta
 * que el fotógrafo entregue su usuario ni pasar por OAuth. La clave se pone en
 * la variable de entorno SMUGMUG_API_KEY.
 *
 * Cada galería del sitio se asocia a un álbum de SmugMug en `galerias` (abajo),
 * usando la clave del álbum que aparece en su URL:
 *   https://vladimir.smugmug.com/Casamientos/n-ABC123  ->  "ABC123"
 *
 * Mientras no haya clave configurada, la web funciona igual y muestra fotos de
 * ejemplo, así se puede ver y aprobar el diseño antes de conectar la cuenta.
 */

import { tiposDeEvento } from "./site";

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

export type Galeria = {
  slug: string;
  nombre: string;
  /** Clave del álbum en SmugMug (la parte después de "n-" en la URL). */
  albumKey?: string;
  fotos: Foto[];
};

/**
 * Álbumes de SmugMug asociados a cada galería. Una galería puede juntar varios
 * álbumes: se escriben separados por coma y las fotos se muestran mezcladas.
 */
export const albumesPorGaleria: Record<string, string | undefined> = {
  "15-anios": process.env.SMUGMUG_ALBUM_15,
  casamientos: process.env.SMUGMUG_ALBUM_CASAMIENTOS,
  "eventos-empresariales": process.env.SMUGMUG_ALBUM_EMPRESAS,
};

/** "abc, def" -> ["abc", "def"] (tolera espacios y comas de más). */
function clavesDe(valor?: string): string[] {
  return (valor ?? "").split(",").map((c) => c.trim()).filter(Boolean);
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
 * Arma las URLs de las distintas medidas a partir del nombre de archivo que
 * devuelve SmugMug. El sufijo antes de la extensión define el tamaño servido
 * por su CDN (S, M, L, X2, etc.), así no hace falta un pedido extra por foto.
 */
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
    .map((img) => ({
      id: img.ImageKey,
      titulo: img.Title || img.Caption || img.FileName || "",
      miniatura: urlEnMedida(img.ThumbnailUrl!, "M"),
      grande: urlEnMedida(img.ThumbnailUrl!, "X3"),
      ancho: img.OriginalWidth ?? 1600,
      alto: img.OriginalHeight ?? 1067,
    }));
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
  const claves = clavesDe(albumesPorGaleria[slug]);
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

/** Las galerías del sitio, con el nombre lindo de cada tipo de evento. */
export const galerias = tiposDeEvento.map((t) => ({
  slug: t.slug,
  nombre: t.nombre,
  albumKey: albumesPorGaleria[t.slug],
}));
