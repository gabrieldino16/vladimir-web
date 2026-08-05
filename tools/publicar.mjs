/**
 * Publica la web en produccion.
 *
 *   npm run publicar
 *
 * Sube los archivos tal como estan en el disco, sin los metadatos del
 * repositorio. Antes de subir compila y revisa el codigo, para no publicar
 * algo que no compila.
 *
 * Importante: publica lo que hay en la carpeta, no lo que esta en GitHub.
 * Conviene tener los cambios ya confirmados para que las dos cosas coincidan.
 */
import { spawnSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GIT = path.join(raiz, ".git");
const PAUSA = path.join(raiz, ".git-pausa");

const correr = (orden, args) =>
  spawnSync(orden, args, { cwd: raiz, stdio: "inherit", shell: true }).status ?? 1;

/**
 * Devuelve la carpeta a su lugar. Se llama tanto al terminar bien como si algo
 * corta el proceso a la mitad: quedarse sin .git seria bastante peor que no
 * haber publicado.
 */
function restaurar() {
  if (existsSync(PAUSA) && !existsSync(GIT)) {
    renameSync(PAUSA, GIT);
    console.log("\nCarpeta .git restaurada.");
  }
}

for (const senal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(senal, () => {
    restaurar();
    process.exit(1);
  });
}
process.on("uncaughtException", (e) => {
  restaurar();
  console.error(e);
  process.exit(1);
});

if (existsSync(PAUSA)) {
  console.error(
    "Existe una carpeta .git-pausa de una publicacion anterior que quedo a medias.\n" +
      "Revisala antes de seguir: si no hay ninguna .git, renombrala de vuelta a .git.",
  );
  process.exit(1);
}

console.log("Compilando y revisando antes de publicar...\n");
if (correr("npm", ["run", "build"]) !== 0) {
  console.error("\nLa compilacion fallo. No se publico nada.");
  process.exit(1);
}
if (correr("npx", ["eslint", "."]) !== 0) {
  console.error("\nEl revisor de codigo encontro problemas. No se publico nada.");
  process.exit(1);
}

console.log("\nPublicando...\n");
let salida = 1;
try {
  renameSync(GIT, PAUSA);
  salida = correr("npx", ["vercel", "--prod", "--yes"]);
} finally {
  restaurar();
}

process.exit(salida);
