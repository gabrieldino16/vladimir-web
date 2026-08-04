/**
 * Armado del presupuesto en PDF (se genera en el navegador, sin servidor).
 *
 * Mantiene la identidad de la marca: encabezado negro, filetes dorados y la
 * tipografía serif del logo.
 */
import { jsPDF } from "jspdf";
import type { Item } from "./packs";

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
};

const NEGRO: [number, number, number] = [10, 10, 10];
const DORADO: [number, number, number] = [201, 162, 74];
const GRIS: [number, number, number] = [110, 110, 110];
const TEXTO: [number, number, number] = [35, 35, 35];

export function generarPresupuesto(datos: DatosPresupuesto) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const margen = 18;
  let y = 0;

  // ---------------------------------------------------------------- encabezado
  doc.setFillColor(...NEGRO);
  doc.rect(0, 0, ancho, 46, "F");

  doc.setTextColor(...DORADO);
  doc.setFont("times", "normal");
  doc.setFontSize(22);
  doc.text("VLADIMIR KRAUCHUK", margen, 24);

  doc.setFontSize(8);
  doc.setTextColor(190, 190, 190);
  doc.text("F O T O   &   V I D E O", margen, 31);

  doc.setFontSize(9);
  doc.setTextColor(...DORADO);
  doc.text("PRESUPUESTO", ancho - margen, 24, { align: "right" });
  doc.setTextColor(190, 190, 190);
  doc.setFontSize(8);
  doc.text(
    new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    ancho - margen,
    31,
    { align: "right" },
  );

  y = 62;

  // ------------------------------------------------------------ datos cliente
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text("CLIENTE", margen, y);

  doc.setFontSize(14);
  doc.setTextColor(...TEXTO);
  doc.setFont("times", "normal");
  doc.text(datos.cliente || "—", margen, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text("EVENTO", ancho / 2, y);
  doc.text("FECHA", ancho - margen, y, { align: "right" });

  doc.setFontSize(11);
  doc.setTextColor(...TEXTO);
  doc.text(datos.tipoEvento || "—", ancho / 2, y + 7);
  doc.text(formatearFecha(datos.fechaEvento), ancho - margen, y + 7, {
    align: "right",
  });

  y += 18;
  doc.setDrawColor(...DORADO);
  doc.setLineWidth(0.4);
  doc.line(margen, y, ancho - margen, y);
  y += 14;

  // ------------------------------------------------------------------- pack
  doc.setFont("times", "normal");
  doc.setFontSize(17);
  doc.setTextColor(...TEXTO);
  doc.text(datos.nombrePack, margen, y);
  y += 10;

  // ------------------------------------------------------------------ items
  doc.setFontSize(9);
  for (const item of datos.items) {
    // Salto de página si no entra el bloque completo.
    if (y > alto - 60) {
      doc.addPage();
      y = 28;
    }

    doc.setFillColor(...DORADO);
    doc.circle(margen + 1.4, y - 1.4, 1.1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXTO);
    doc.text(item.titulo.toUpperCase(), margen + 6, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRIS);
    const lineas = doc.splitTextToSize(item.detalle, ancho - margen * 2 - 6);
    doc.text(lineas, margen + 6, y);
    y += lineas.length * 4 + 6;
  }

  // ------------------------------------------------------------------ total
  if (y > alto - 55) {
    doc.addPage();
    y = 28;
  }
  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margen, y, ancho - margen, y);
  y += 12;

  doc.setFillColor(...NEGRO);
  doc.rect(margen, y - 8, ancho - margen * 2, 18, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(190, 190, 190);
  doc.text("TOTAL", margen + 6, y + 3);

  doc.setFont("times", "normal");
  doc.setFontSize(18);
  doc.setTextColor(...DORADO);
  doc.text(
    `${datos.moneda} ${datos.precio.toLocaleString("es-AR")}`,
    ancho - margen - 6,
    y + 4,
    { align: "right" },
  );
  y += 22;

  // ---------------------------------------------------------- observaciones
  if (datos.observaciones?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    const lineas = doc.splitTextToSize(
      datos.observaciones.trim(),
      ancho - margen * 2,
    );
    doc.text(lineas, margen, y);
    y += lineas.length * 4 + 6;
  }

  doc.setFontSize(7.5);
  doc.setTextColor(...GRIS);
  doc.text(
    `Presupuesto válido por ${datos.validezDias} días desde la fecha de emisión.`,
    margen,
    y,
  );

  // -------------------------------------------------------------------- pie
  doc.setFillColor(...NEGRO);
  doc.rect(0, alto - 20, ancho, 20, "F");
  doc.setFontSize(8);
  doc.setTextColor(...DORADO);
  doc.text("@vladimirkrau.ph", margen, alto - 8);
  doc.setTextColor(190, 190, 190);
  doc.text("+54 9 341 578-3412", ancho - margen, alto - 8, { align: "right" });

  const nombreArchivo = `Presupuesto - ${datos.cliente || "cliente"}.pdf`;
  doc.save(nombreArchivo);
  return nombreArchivo;
}

function formatearFecha(fecha: string) {
  if (!fecha) return "A confirmar";
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
