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

  fundirConElFondo(pincel, ancho, alto);

  return lienzo.toDataURL("image/jpeg", 0.86);
}

/**
 * Oscurece la foto arriba y la apaga hacia abajo hasta el negro, para que se
 * funda con la hoja y el nombre se lea sobre cualquier imagen.
 *
 * Se hace acá, sobre la foto, y no dibujando rectángulos encima en el PDF: los
 * PDF no tienen degradados propios, así que había que apilar decenas de
 * rectángulos translúcidos y varios visores dibujaban el borde de cada uno como
 * una línea. Sobre el lienzo el degradado es uno solo y sale parejo.
 */
function fundirConElFondo(pincel: CanvasRenderingContext2D, ancho: number, alto: number) {
  // Hacia abajo: limpio un buen tramo y recién sobre el final cierra en negro.
  const abajo = pincel.createLinearGradient(0, alto * 0.34, 0, alto);
  abajo.addColorStop(0, "rgba(10,10,10,0)");
  abajo.addColorStop(0.5, "rgba(10,10,10,0.25)");
  abajo.addColorStop(0.85, "rgba(10,10,10,0.8)");
  abajo.addColorStop(1, "rgba(10,10,10,1)");
  pincel.fillStyle = abajo;
  pincel.fillRect(0, alto * 0.34, ancho, alto - alto * 0.34);

  // Hacia arriba: velo parejo detrás del nombre y la fecha.
  const arriba = pincel.createLinearGradient(0, 0, 0, alto * 0.42);
  arriba.addColorStop(0, "rgba(10,10,10,0.85)");
  arriba.addColorStop(1, "rgba(10,10,10,0)");
  pincel.fillStyle = arriba;
  pincel.fillRect(0, 0, ancho, alto * 0.42);
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
