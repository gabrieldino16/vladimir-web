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
import { PORTADAS_VACIAS, type Eleccion, type Encuadre, type Portadas } from "./portadas";

const ARCHIVO = "portadas.json";

export async function leerPortadas(): Promise<Portadas> {
  const guardadas = await leer<Portadas>(ARCHIVO);
  if (!guardadas) return PORTADAS_VACIAS;
  return { ...guardadas, galerias: guardadas.galerias ?? {} };
}

export async function guardarPortadas(portadas: Portadas): Promise<void> {
  await guardar(ARCHIVO, portadas);
}

/** La foto elegida junto con su encuadre. */
export type PortadaResuelta = { foto: Foto; encuadre: Encuadre };

/**
 * Busca las fotos elegidas dentro de sus galerías. Si una foto ya no está
 * —porque se borró el álbum o se cambió de lugar— se ignora la elección y
 * vuelve a mandar el automático, en vez de dejar un hueco.
 */
export async function resolverPortadas(fotosPorGaleria: Record<string, Foto[]>): Promise<{
  inicio?: PortadaResuelta;
  galerias: Record<string, PortadaResuelta>;
}> {
  const portadas = await leerPortadas();

  const buscar = (eleccion?: Eleccion): PortadaResuelta | undefined => {
    if (!eleccion) return undefined;
    const foto = fotosPorGaleria[eleccion.galeria]?.find((f) => f.id === eleccion.id);
    return foto ? { foto, encuadre: eleccion.encuadre } : undefined;
  };

  const galerias: Record<string, PortadaResuelta> = {};
  for (const [slug, eleccion] of Object.entries(portadas.galerias)) {
    const resuelta = buscar(eleccion);
    if (resuelta) galerias[slug] = resuelta;
  }

  return { inicio: buscar(portadas.inicio), galerias };
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
