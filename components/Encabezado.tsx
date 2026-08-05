/** Encabezado de sección: volanta dorada, título serif y filete. */
export function Encabezado({
  volanta,
  titulo,
  bajada,
}: {
  /** Etiqueta chica en dorado. Se omite cuando el título ya dice todo. */
  volanta?: string;
  titulo: string;
  bajada?: string;
}) {
  return (
    <div className="text-center">
      {volanta && (
        <span className="text-xs tracking-[0.4em] text-dorado uppercase">{volanta}</span>
      )}
      <h2 className={`titulo text-4xl font-light sm:text-5xl ${volanta ? "mt-4" : ""}`}>
        {titulo}
      </h2>
      <div className="filete mx-auto mt-6 w-40" />
      {bajada && (
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-texto-tenue">{bajada}</p>
      )}
    </div>
  );
}
