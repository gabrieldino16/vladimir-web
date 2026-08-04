/**
 * Isologo del estudio: cámara de línea con el monograma VK.
 *
 * El archivo original es un PNG en blanco y negro. Al procesarlo se guardó la
 * FORMA en el canal alfa (`public/logo-marca.png` y `public/logo-completo.png`),
 * lo que permite usarlo como máscara CSS y pintarlo con el degradé dorado de la
 * marca en lugar de dejarlo negro. Ventajas frente a incrustar la imagen tal
 * cual: toma el color de la identidad, se ve bien sobre el fondo oscuro y si
 * algún día cambia el tono de dorado, cambia en todo el sitio de una sola vez.
 */

const VARIANTES = {
  /** Sólo la cámara con el monograma. */
  marca: { src: "/logo-marca.png", proporcion: 268 / 204 },
  /** La cámara con el nombre debajo. */
  completo: { src: "/logo-completo.png", proporcion: 324 / 243 },
} as const;

export function Logo({
  className = "",
  conNombre = false,
}: {
  className?: string;
  /** true muestra la versión con el nombre incluido. */
  conNombre?: boolean;
}) {
  const { src, proporcion } = VARIANTES[conNombre ? "completo" : "marca"];

  return (
    <span
      role="img"
      aria-label="Vladimir Krauchuk, fotografía y video"
      className={`marca-dorada inline-block ${className}`}
      style={{
        aspectRatio: proporcion,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}
