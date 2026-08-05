/**
 * Lectura y guardado de las portadas. Solo corre en el servidor: toca el
 * almacenamiento y pide las fotos a SmugMug.
 *
 * Sin elección guardada la web sigue eligiendo sola —apaisada para el fondo del
 * inicio, vertical para las tarjetas—, así que esto solo pisa el automático
 * cuando el fotógrafo decidió otra cosa.
 */
import { leer, guardar } from "./almacen";
import { esApaisada, fotosDeGaleria, type Foto } from "./smugmug";
import { tiposDeEvento } from "./site";
import {
  ENCUADRE_POR_DEFECTO,
  PORTADAS_VACIAS,
  aPosicionCss,
  type Eleccion,
  type Encuadre,
  type Portadas,
} from "./portadas";

const ARCHIVO = "portadas.json";

export async function leerPortadas(): Promise<Portadas> {
  const guardadas = await leer<Portadas>(ARCHIVO);
  if (!guardadas) return PORTADAS_VACIAS;
  return { ...guardadas, galerias: guardadas.galerias ?? {} };
}

export async function guardarPortadas(portadas: Portadas): Promise<void> {
  await guardar(ARCHIVO, portadas);
}

/** La foto elegida junto con sus encuadres. */
export type PortadaResuelta = {
  foto: Foto;
  encuadre: Encuadre;
  encuadreMovil?: Encuadre;
};

/**
 * Busca las fotos elegidas dentro de sus galerías. Si una foto ya no está
 * —porque se borró el álbum o se cambió de lugar— se ignora la elección y
 * vuelve a mandar el automático, en vez de dejar un hueco.
 */
export async function resolverPortadas(fotosPorGaleria: Record<string, Foto[]>): Promise<{
  inicio?: PortadaResuelta;
  beneficio?: PortadaResuelta;
  galerias: Record<string, PortadaResuelta>;
}> {
  const portadas = await leerPortadas();

  const buscar = (eleccion?: Eleccion): PortadaResuelta | undefined => {
    if (!eleccion) return undefined;
    const foto = fotosPorGaleria[eleccion.galeria]?.find((f) => f.id === eleccion.id);
    return foto
      ? { foto, encuadre: eleccion.encuadre, encuadreMovil: eleccion.encuadreMovil }
      : undefined;
  };

  const galerias: Record<string, PortadaResuelta> = {};
  for (const [slug, eleccion] of Object.entries(portadas.galerias)) {
    const resuelta = buscar(eleccion);
    if (resuelta) galerias[slug] = resuelta;
  }

  return {
    inicio: buscar(portadas.inicio),
    beneficio: buscar(portadas.beneficio),
    galerias,
  };
}

/**
 * Trae las fotos de todas las galerías de una vez. Lo usan la portada, la
 * página de galerías y el panel, para no repetir el mismo pedido.
 */
export async function fotosDeTodasLasGalerias(limite = 24): Promise<Record<string, Foto[]>> {
  const listas = await Promise.all(
    tiposDeEvento.map(async (t) => [t.slug, await fotosDeGaleria(t.slug, limite)] as const),
  );
  return Object.fromEntries(listas);
}

/** La que se usa si el fotógrafo todavía no eligió: la primera apaisada. */
export function automaticaDelInicio(fotosPorGaleria: Record<string, Foto[]>) {
  return Object.values(fotosPorGaleria).flat().find(esApaisada);
}

/** Para las tarjetas, que son verticales, se prefiere una foto vertical. */
export function automaticaDeGaleria(fotos: Foto[]) {
  return fotos.find((f) => !esApaisada(f)) ?? fotos[0];
}

/** Una foto de la rotación, ya con el encuadre resuelto para el navegador. */
export type FotoDePortada = {
  foto: Foto;
  posicion?: string;
  posicionMovil?: string;
};

/**
 * Toma unas pocas fotos repartidas a lo largo de la lista, en vez de las
 * primeras. Los álbumes son secuencias de una misma sesión: las primeras cinco
 * serían casi la misma foto y la rotación no se notaría.
 */
function repartir(fotos: Foto[], cantidad: number): Foto[] {
  if (fotos.length <= cantidad) return fotos;
  const paso = fotos.length / cantidad;
  return Array.from({ length: cantidad }, (_, i) => fotos[Math.floor(i * paso)]);
}

/**
 * Arma la lista de fotos que se van turnando en una portada.
 *
 * La elegida por el fotógrafo va primera y conserva su encuadre; las demás
 * usan el de por defecto, que muestra la franja de arriba.
 */
export function armarRotacion(
  candidatas: Foto[],
  elegida: PortadaResuelta | undefined,
  cantidad = 5,
): FotoDePortada[] {
  const porDefecto = aPosicionCss(ENCUADRE_POR_DEFECTO);
  const resto = repartir(
    candidatas.filter((f) => f.id !== elegida?.foto.id),
    elegida ? cantidad - 1 : cantidad,
  ).map((foto) => ({ foto, posicion: porDefecto }));

  if (!elegida) return resto;

  return [
    {
      foto: elegida.foto,
      posicion: aPosicionCss(elegida.encuadre),
      posicionMovil: elegida.encuadreMovil
        ? aPosicionCss(elegida.encuadreMovil)
        : undefined,
    },
    ...resto,
  ];
}
