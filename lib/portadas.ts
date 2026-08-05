/**
 * Portadas elegidas a mano desde el panel: la foto grande del inicio y la de
 * cada galería.
 *
 * Acá viven solamente los tipos y las cuentas, sin nada de servidor, porque
 * este archivo también lo usa la pantalla del panel dentro del navegador.
 * La lectura y el guardado están en `portadas-servidor.ts`.
 */

/** Qué parte de la foto queda a la vista cuando el recuadro la recorta. */
export type Encuadre = { x: number; y: number };

export type Eleccion = {
  /** Identificador de la foto en SmugMug. */
  id: string;
  /** De qué galería salió, para poder ir a buscarla. */
  galeria: string;
  encuadre: Encuadre;
  /**
   * Encuadre para el celular. Solo lo usan las portadas a pantalla completa:
   * ahí el recuadro pasa de ancho a alto y el mismo punto no sirve para las
   * dos. En las tarjetas el recuadro es vertical siempre, así que no hace falta.
   */
  encuadreMovil?: Encuadre;
};

export type Portadas = {
  inicio?: Eleccion;
  beneficio?: Eleccion;
  galerias: Record<string, Eleccion>;
};

/**
 * Por defecto se muestra la franja de arriba: en una foto de personas es donde
 * están las caras. Centrar el recorte suele dejarlas afuera.
 */
export const ENCUADRE_POR_DEFECTO: Encuadre = { x: 0.5, y: 0.25 };

export const PORTADAS_VACIAS: Portadas = { galerias: {} };

/** Lo que entiende CSS en `object-position`. */
export function aPosicionCss(encuadre: Encuadre = ENCUADRE_POR_DEFECTO) {
  return `${Math.round(encuadre.x * 100)}% ${Math.round(encuadre.y * 100)}%`;
}
