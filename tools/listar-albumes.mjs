/**
 * Lista los álbumes públicos de una cuenta de SmugMug con su clave, para poder
 * completar las variables SMUGMUG_ALBUM_* de .env.local sin buscar los enlaces
 * uno por uno.
 *
 * Uso:
 *   node tools/listar-albumes.mjs <usuario-de-smugmug>
 *
 * El usuario es el nombre que aparece en la dirección de su galería:
 *   https://vladimirkrauchuk.smugmug.com  ->  vladimirkrauchuk
 */
import { readFileSync } from "node:fs";

const API = "https://api.smugmug.com/api/v2";

function leerClave() {
  if (process.env.SMUGMUG_API_KEY) return process.env.SMUGMUG_API_KEY;
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    return env.match(/^SMUGMUG_API_KEY=(.+)$/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

async function pedir(ruta, clave) {
  const url = `${API}${ruta}${ruta.includes("?") ? "&" : "?"}APIKey=${clave}`;
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  const cuerpo = await r.json();
  if (cuerpo.Code !== 200) {
    throw new Error(`${cuerpo.Code} ${cuerpo.Message}`);
  }
  return cuerpo.Response;
}

const usuario = process.argv[2];
const clave = leerClave();

if (!usuario) {
  console.error("Falta el usuario.  Ej: node tools/listar-albumes.mjs vladimirkrauchuk");
  process.exit(1);
}
if (!clave) {
  console.error("No encontré SMUGMUG_API_KEY (revisá .env.local).");
  process.exit(1);
}

try {
  const { User } = await pedir(`/user/${usuario}`, clave);
  console.log(`\nCuenta: ${User.Name} (${User.NickName})\n`);

  const uri = User.Uris.UserAlbums.Uri;
  const { Album: albumes = [] } = await pedir(`${uri.replace("/api/v2", "")}?count=200`, clave);

  if (albumes.length === 0) {
    console.log("No hay álbumes públicos en esta cuenta.");
  }

  for (const a of albumes) {
    console.log(`  ${a.Name}`);
    console.log(`     fotos: ${a.ImageCount ?? "?"}   clave: ${a.AlbumKey}`);
    console.log(`     ${a.WebUri}\n`);
  }

  console.log("Copiá la 'clave' del álbum en la variable que corresponda de .env.local:");
  console.log("  SMUGMUG_ALBUM_15= / SMUGMUG_ALBUM_CASAMIENTOS= / SMUGMUG_ALBUM_EMPRESAS=\n");
} catch (error) {
  console.error("\nError al consultar SmugMug:", error.message);
  console.error("Revisá que el usuario exista y que la galería sea pública.\n");
  process.exit(1);
}
