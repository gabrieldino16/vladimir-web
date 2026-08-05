/**
 * Armado del presupuesto en PDF (se genera en el navegador, sin servidor).
 *
 * Sigue la identidad de la web: fondo negro, filetes dorados y tipografía serif.
 * La primera hoja abre con una foto a sangre que se funde con el negro, igual
 * que la portada del sitio.
 */
import { jsPDF } from "jspdf";
import type { Item } from "./packs";
import { site } from "./site";

export type DatosPresupuesto = {
  cliente: string;
  tipoEvento: string;
  fechaEvento: string;
  nombrePack: string;
  items: Item[];
  precio: number;
  moneda: string;
  observaciones?: string;
  validezDias: number;
  /** Foto de portada ya recortada, como "data URL". Sin ella la portada es lisa. */
  fotoPortada?: string;
};

type Color = [number, number, number];

// Los mismos valores que las variables de globals.css.
const NEGRO: Color = [10, 10, 10];
const NEGRO_SUAVE: Color = [18, 18, 18];
const DORADO: Color = [201, 162, 74];
const DORADO_CLARO: Color = [237, 218, 164];
const TEXTO: Color = [242, 242, 242];
const TENUE: Color = [168, 168, 168];

const MARGEN = 18;
/**
 * Alto de la foto de portada y proporción que se le pide al recorte.
 * Cuanto más apaisada, menos entra de una foto vertical: 118 mm es el punto
 * donde la portada sigue siendo una franja y no descarta media foto.
 */
const ALTO_PORTADA = 108;

/** Lo que ocupa el bloque del total: se reserva para que no quede huérfano. */
const ALTO_TOTAL = 25;
export const PROPORCION_PORTADA = 210 / ALTO_PORTADA;

export function generarPresupuesto(datos: DatosPresupuesto) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();

  fondoNegro(doc, ancho, alto);

  let y: number;

  // ---------------------------------------------------------------- portada
  if (datos.fotoPortada) {
    // La foto ya viene con el degradado adentro (ver `foto-portada.ts`): se
    // funde con el negro de la hoja sin dibujar nada encima.
    doc.addImage(datos.fotoPortada, "JPEG", 0, 0, ancho, ALTO_PORTADA);
    y = ALTO_PORTADA + 12;
  } else {
    y = 54;
  }

  // ------------------------------------------------------------------ marca
  doc.setFont("times", "normal");
  doc.setFontSize(21);
  doc.setTextColor(...DORADO_CLARO);
  doc.text("VLADIMIR KRAUCHUK", MARGEN, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  // Sobre la foto conviene el gris claro; sin foto, el tenue de siempre.
  doc.setTextColor(...(datos.fotoPortada ? TEXTO : TENUE));
  doc.text("F O T O   &   V I D E O", MARGEN, 28.5);

  doc.setFontSize(7.5);
  doc.setTextColor(...DORADO_CLARO);
  doc.text("PRESUPUESTO", ancho - MARGEN, 22, { align: "right" });
  doc.setTextColor(...(datos.fotoPortada ? TEXTO : TENUE));
  doc.text(fechaDeHoy(), ancho - MARGEN, 28.5, { align: "right" });

  // ------------------------------------------------------------ datos cliente
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...DORADO);
  doc.text("CLIENTE", MARGEN, y);
  doc.text("EVENTO", ancho / 2, y);
  doc.text("FECHA", ancho - MARGEN, y, { align: "right" });

  y += 8;
  doc.setFont("times", "normal");
  doc.setFontSize(15);
  doc.setTextColor(...TEXTO);
  doc.text(datos.cliente || "—", MARGEN, y);
  doc.setFontSize(12);
  doc.text(datos.tipoEvento || "—", ancho / 2, y);
  doc.text(formatearFecha(datos.fechaEvento), ancho - MARGEN, y, {
    align: "right",
  });

  y += 8;
  linea(doc, MARGEN, y, ancho - MARGEN, DORADO, 0.4);
  y += 12;

  // ------------------------------------------------------------------- pack
  doc.setFont("times", "normal");
  doc.setFontSize(18);
  doc.setTextColor(...DORADO_CLARO);
  doc.text(datos.nombrePack, MARGEN, y);
  y += 10;

  // El cierre (total, observaciones y validez) se mide antes de acomodar los
  // ítems, para poder reservarle lugar y que no termine solo en otra hoja.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const notas = datos.observaciones?.trim()
    ? doc.splitTextToSize(datos.observaciones.trim(), ancho - MARGEN * 2)
    : [];
  const altoCierre = ALTO_TOTAL + notas.length * 4 + 11;

  // ------------------------------------------------------------------ items
  const limite = alto - 26;
  datos.items.forEach((item, indice) => {
    const lineas = doc.splitTextToSize(item.detalle, ancho - MARGEN * 2 - 12);
    const altoBloque = 10.5 + lineas.length * 4.2;

    // Al último ítem se le suma el cierre: si no entran los dos, pasan juntos a
    // la hoja siguiente. Si no, el total quedaría solo arriba de una hoja vacía.
    const necesita =
      altoBloque + (indice === datos.items.length - 1 ? altoCierre : 0);

    if (y + necesita > limite) {
      doc.addPage();
      fondoNegro(doc, ancho, alto);
      y = 28;
    }

    // Recuadro apenas más claro que el fondo, como las tarjetas de la web.
    doc.setFillColor(...NEGRO_SUAVE);
    doc.rect(MARGEN, y - 6, ancho - MARGEN * 2, altoBloque, "F");
    // Filete dorado al costado, para dar el acento sin recuadrar todo.
    doc.setFillColor(...DORADO);
    doc.rect(MARGEN, y - 6, 0.8, altoBloque, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...TEXTO);
    doc.text(item.titulo.toUpperCase(), MARGEN + 7, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TENUE);
    doc.text(lineas, MARGEN + 7, y + 5.5);

    y += altoBloque + 3.5;
  });

  // ------------------------------------------------------------------ total
  if (y + altoCierre > limite) {
    doc.addPage();
    fondoNegro(doc, ancho, alto);
    y = 28;
  }
  y += 5;

  // Bloque dorado lleno: es lo único invertido de la hoja, para que el precio
  // sea lo primero que se ve.
  doc.setFillColor(...DORADO);
  doc.rect(MARGEN, y, ancho - MARGEN * 2, 20, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...NEGRO);
  doc.text("TOTAL", MARGEN + 7, y + 12);

  doc.setFont("times", "normal");
  doc.setFontSize(19);
  doc.text(
    `${datos.moneda} ${datos.precio.toLocaleString("es-AR")}`,
    ancho - MARGEN - 7,
    y + 13,
    { align: "right" },
  );
  y += 30;

  // ---------------------------------------------------------- observaciones
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...TENUE);

  if (notas.length > 0) {
    doc.text(notas, MARGEN, y);
    y += notas.length * 4 + 5;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...TENUE);
  doc.text(
    `Presupuesto válido por ${datos.validezDias} días desde la fecha de emisión.`,
    MARGEN,
    y,
  );

  // ------------------------------------------------- pie (en todas las hojas)
  const hojas = doc.getNumberOfPages();
  for (let hoja = 1; hoja <= hojas; hoja++) {
    doc.setPage(hoja);
    linea(doc, MARGEN, alto - 16, ancho - MARGEN, DORADO, 0.3, 0.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DORADO);
    // Los datos salen de site.ts: escritos acá a mano se quedan viejos cuando
    // cambia una red o un telefono, y el presupuesto es lo que ve el cliente.
    doc.text(`@${site.contacto.instagram}`, MARGEN, alto - 10);

    doc.setTextColor(...TENUE);
    doc.text(site.contacto.whatsappTexto, ancho / 2, alto - 10, { align: "center" });
    doc.text(
      hojas > 1 ? `${hoja} / ${hojas}` : site.contacto.ciudad,
      ancho - MARGEN,
      alto - 10,
      { align: "right" },
    );
  }

  const nombreArchivo = `Presupuesto - ${datos.cliente || "cliente"}.pdf`;
  doc.save(nombreArchivo);
  return nombreArchivo;
}

/** Pinta la hoja entera de negro: es el fondo de todo el documento. */
function fondoNegro(doc: jsPDF, ancho: number, alto: number) {
  doc.setFillColor(...NEGRO);
  doc.rect(0, 0, ancho, alto, "F");
}

function linea(
  doc: jsPDF,
  x1: number,
  y: number,
  x2: number,
  color: Color,
  grosor: number,
  opacidad = 1,
) {
  doc.saveGraphicsState();
  if (opacidad < 1) {
    doc.setGState(
      new (doc as unknown as { GState: new (o: object) => object }).GState({
        opacity: opacidad,
      }),
    );
  }
  doc.setDrawColor(...color);
  doc.setLineWidth(grosor);
  doc.line(x1, y, x2, y);
  doc.restoreGraphicsState();
}

function fechaDeHoy() {
  return new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearFecha(fecha: string) {
  if (!fecha) return "A confirmar";
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
