/**
 * Acceso al panel privado.
 *
 * Es una autenticación simple pensada para un solo usuario (el fotógrafo):
 * usuario y contraseña se guardan en variables de entorno y la sesión se
 * mantiene con una cookie firmada. No hay base de datos.
 *
 * La cookie guarda "vencimiento.firma", donde la firma es un HMAC hecho con
 * SESSION_SECRET: sin ese secreto no se puede falsificar.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "vk_panel";
const DURACION_HORAS = 12;

function secreto() {
  const valor = process.env.SESSION_SECRET;
  if (!valor) throw new Error("Falta SESSION_SECRET");
  return valor;
}

function firmar(dato: string) {
  return createHmac("sha256", secreto()).update(dato).digest("hex");
}

/** Compara sin filtrar información por el tiempo que tarda. */
function igualesSeguro(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function credencialesValidas(usuario: string, clave: string) {
  const usuarioOk = process.env.PANEL_USUARIO;
  const claveOk = process.env.PANEL_CLAVE;
  if (!usuarioOk || !claveOk) return false;
  return igualesSeguro(usuario, usuarioOk) && igualesSeguro(clave, claveOk);
}

export function armarValorCookie() {
  const vence = Date.now() + DURACION_HORAS * 60 * 60 * 1000;
  return `${vence}.${firmar(String(vence))}`;
}

export function cookieValida(valor?: string) {
  if (!valor) return false;
  const [vence, firma] = valor.split(".");
  if (!vence || !firma) return false;
  if (Number(vence) < Date.now()) return false;
  try {
    return igualesSeguro(firma, firmar(vence));
  } catch {
    return false;
  }
}

/** Para usar en páginas y rutas del servidor. */
export async function haySesion() {
  const galletas = await cookies();
  return cookieValida(galletas.get(COOKIE)?.value);
}

export const NOMBRE_COOKIE = COOKIE;
export const DURACION_SEGUNDOS = DURACION_HORAS * 60 * 60;
