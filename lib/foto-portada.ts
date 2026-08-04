/**
 * Preparación de la foto que va en la portada del presupuesto.
 *
 * jsPDF estira la imagen al recuadro que se le dé, así que si la proporción no
 * coincide la foto sale deformada. Acá se recorta antes, como hace el "object-fit:
 * cover" de la web: se centra y se descarta lo que sobra.
 *
 * De paso se reescala y se pasa a JPEG, para que el PDF no pese de más.
 */

/** Ancho máximo en píxeles: alcanza de sobra para una hoja A4. */
const ANCHO_MAXIMO = 1600;

/**
 * Dónde se quiere que caiga el centro de la franja, medido sobre el alto de la
 * foto original. Un cuarto desde arriba: es donde suelen estar las caras.
 * Centrar el recorte (0,5) deja la cara afuera en cualquier foto vertical.
 */
const CENTRO_BUSCADO = 0.25;

/** Se usa sólo si no se pudo medir la foto. */
export const FOCO_POR_DEFECTO = 0.2;

/**
 * Encuadre inicial para una foto: el que deja las caras adentro en la mayoría
 * de los casos. Después se puede mover a mano.
 */
export async function focoSugerido(
  origen: string,
  proporcion: number,
): Promise<number> {
  try {
    const imagen = await cargar(origen);
    const { alto, sobra } = medidasDelRecorte(imagen, proporcion);
    if (sobra <= 0) return 0.5;
    // Se corre la franja para que su centro caiga en el punto buscado.
    return acotar((CENTRO_BUSCADO * imagen.naturalHeight - alto / 2) / sobra);
  } catch {
    return FOCO_POR_DEFECTO;
  }
}

export async function recortarParaPortada(
  origen: string,
  proporcion: number,
  /** Qué parte de la foto queda a la vista: 0 = arriba de todo, 1 = abajo. */
  foco = FOCO_POR_DEFECTO,
): Promise<string> {
  const imagen = await cargar(origen);

  const ancho = Math.min(imagen.naturalWidth, ANCHO_MAXIMO);
  const alto = Math.round(ancho / proporcion);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;

  const pincel = lienzo.getContext("2d");
  if (!pincel) throw new Error("El navegador no pudo preparar la imagen.");

  const recorte = medidasDelRecorte(imagen, proporcion);

  // De ancho siempre va centrado; de alto manda el foco.
  const desdeX = (imagen.naturalWidth - recorte.ancho_) / 2;
  const desdeY = recorte.sobra * acotar(foco);

  pincel.drawImage(
    imagen,
    desdeX,
    desdeY,
    recorte.ancho_,
    recorte.alto,
    0,
    0,
    ancho,
    alto,
  );

  return lienzo.toDataURL("image/jpeg", 0.86);
}

/** El recorte más grande del original que respeta la proporción pedida. */
function medidasDelRecorte(imagen: HTMLImageElement, proporcion: number) {
  const proporcionOriginal = imagen.naturalWidth / imagen.naturalHeight;
  const ancho_ =
    proporcionOriginal > proporcion
      ? imagen.naturalHeight * proporcion
      : imagen.naturalWidth;
  const alto =
    proporcionOriginal > proporcion
      ? imagen.naturalHeight
      : imagen.naturalWidth / proporcion;
  return { ancho_, alto, sobra: imagen.naturalHeight - alto };
}

function acotar(valor: number) {
  return Math.min(Math.max(valor, 0), 1);
}

function cargar(origen: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rechazar) => {
    const imagen = new Image();
    imagen.onload = () => resolver(imagen);
    imagen.onerror = () => rechazar(new Error("No se pudo leer la foto."));
    imagen.src = origen;
  });
}

/** Lee un archivo elegido desde la compu y lo devuelve como "data URL". */
export function leerArchivo(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = () => rechazar(new Error("No se pudo leer el archivo."));
    lector.readAsDataURL(archivo);
  });
}
