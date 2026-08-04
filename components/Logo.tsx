/**
 * Logo de la marca: cámara de línea con el monograma VK.
 *
 * Está dibujado en SVG (no es una imagen) para que se vea nítido en cualquier
 * tamaño, se pinte con el dorado de la marca y no sume peso de descarga.
 * Si más adelante llega el logo original vectorial del diseñador, se reemplaza
 * el contenido de este componente y el resto de la web queda igual.
 */
export function Logo({
  className = "",
  conNombre = false,
}: {
  className?: string;
  conNombre?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 120 92"
        role="img"
        aria-label="Vladimir Krauchuk, fotografía y video"
        className="h-full w-auto"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* cuerpo de la cámara */}
        <path d="M8 30h58v46a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V30Z" />
        {/* saliente superior y visor */}
        <path d="M22 30V22a5 5 0 0 1 5-5h13a5 5 0 0 1 5 5v8" />
        <circle cx="17" cy="24" r="3" />
        {/* lente */}
        <circle cx="37" cy="56" r="17" />
        <circle cx="37" cy="56" r="8" />

        {/* monograma: la V y la K trazadas como en la tarjeta */}
        <path d="M52 10l14 62 8-30" strokeWidth={4} />
        <path d="M84 8v76" strokeWidth={4} />
        <path d="M84 47L112 12" strokeWidth={4} />
        <path d="M84 47l28 37" strokeWidth={4} />
      </svg>

      {conNombre && (
        <span className="flex flex-col leading-none">
          <span className="titulo text-lg tracking-[0.22em] text-texto">
            VLADIMIR KRAUCHUK
          </span>
          <span className="mt-1 text-[0.6rem] tracking-[0.42em] text-texto-tenue">
            FOTO & VIDEO
          </span>
        </span>
      )}
    </span>
  );
}
