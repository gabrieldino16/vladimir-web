/**
 * Guardado de las preferencias que el fotógrafo cambia desde el panel.
 *
 * El proyecto no tiene base de datos a propósito, y en Vercel no se puede
 * escribir en archivos: se pierden en cada despliegue. Así que hay dos formas
 * de guardar y se elige sola según dónde esté corriendo:
 *
 *   - En la compu, mientras se desarrolla: un archivo dentro de `datos/`.
 *   - Publicado: Vercel Blob, si está cargada la variable BLOB_READ_WRITE_TOKEN.
 *     Se habla con su API directamente, sin agregar dependencias.
 *
 * Si no hay ninguna de las dos, leer devuelve null y la web usa sus valores por
 * defecto: nunca se rompe por no tener esto configurado.
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const CARPETA = path.join(process.cwd(), "datos");
const BLOB_API = "https://blob.vercel-storage.com";

const hayBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Lee un archivo guardado. Devuelve null si todavía no existe. */
export async function leer<T>(nombre: string): Promise<T | null> {
  try {
    const crudo = hayBlob() ? await leerDeBlob(nombre) : await leerDeArchivo(nombre);
    return crudo ? (JSON.parse(crudo) as T) : null;
  } catch (error) {
    console.error(`No se pudo leer "${nombre}":`, error);
    return null;
  }
}

export async function guardar(nombre: string, contenido: unknown): Promise<void> {
  const texto = JSON.stringify(contenido, null, 2);
  if (hayBlob()) {
    await guardarEnBlob(nombre, texto);
  } else {
    await mkdir(CARPETA, { recursive: true });
    await writeFile(path.join(CARPETA, nombre), texto, "utf8");
  }
}

async function leerDeArchivo(nombre: string) {
  try {
    return await readFile(path.join(CARPETA, nombre), "utf8");
  } catch {
    return null; // todavía no se guardó nada
  }
}

async function leerDeBlob(nombre: string) {
  // La dirección pública del blob se arma con el prefijo de la cuenta, que
  // viene dentro del propio token: <id>_<secreto>.
  const identificador = process.env.BLOB_READ_WRITE_TOKEN!.split("_")[3];
  const respuesta = await fetch(
    `https://${identificador}.public.blob.vercel-storage.com/${nombre}`,
    { cache: "no-store" },
  );
  return respuesta.ok ? await respuesta.text() : null;
}

async function guardarEnBlob(nombre: string, texto: string) {
  const respuesta = await fetch(`${BLOB_API}/${nombre}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      "x-api-version": "7",
      "x-content-type": "application/json",
      // Sin esto agrega un sufijo al azar al nombre y no se podría volver a leer.
      "x-add-random-suffix": "0",
      "x-cache-control-max-age": "0",
    },
    body: texto,
  });
  if (!respuesta.ok) {
    throw new Error(`Vercel Blob respondió ${respuesta.status}`);
  }
}
