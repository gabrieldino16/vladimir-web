/** Encabezado de sección: volanta dorada, título serif y filete. */
export function Encabezado({
  volanta,
  titulo,
  bajada,
}: {
  volanta: string;
  titulo: string;
  bajada?: string;
}) {
  return (
    <div className="text-center">
      <span className="text-xs tracking-[0.4em] text-dorado uppercase">{volanta}</span>
      <h2 className="titulo mt-4 text-4xl font-light sm:text-5xl">{titulo}</h2>
      <div className="filete mx-auto mt-6 w-40" />
      {bajada && (
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-texto-tenue">{bajada}</p>
      )}
    </div>
  );
}
