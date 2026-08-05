"use client";

import { useState } from "react";
import type { Foto } from "@/lib/smugmug";
import {
  ENCUADRE_POR_DEFECTO,
  aPosicionCss,
  type Eleccion,
  type Encuadre,
  type Portadas as Elecciones,
} from "@/lib/portadas";

type Galeria = { slug: string; nombre: string };

/**
 * Elección de las fotos de portada: la grande del inicio y la de cada galería.
 *
 * Cada recuadro se muestra con la misma forma que tiene en la web, para que lo
 * que se ve acá sea lo que va a quedar publicado.
 */
export function Portadas({
  galerias,
  fotosPorGaleria,
  iniciales,
}: {
  galerias: Galeria[];
  fotosPorGaleria: Record<string, Foto[]>;
  iniciales: Elecciones;
}) {
  const [elecciones, setElecciones] = useState<Elecciones>({
    ...iniciales,
    galerias: iniciales.galerias ?? {},
  });
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [sinCambios, setSinCambios] = useState(true);

  const todas = Object.values(fotosPorGaleria).flat();

  function cambiar(actualizar: (actuales: Elecciones) => Elecciones) {
    setElecciones((actuales) => actualizar(actuales));
    setSinCambios(false);
    setAviso("");
  }

  function elegirInicio(foto: Foto, galeria: string) {
    cambiar((a) => ({
      ...a,
      inicio:
        a.inicio?.id === foto.id
          ? undefined
          : { id: foto.id, galeria, encuadre: ENCUADRE_POR_DEFECTO },
    }));
  }

  function elegirGaleria(slug: string, foto: Foto) {
    cambiar((a) => {
      const siguientes = { ...a.galerias };
      if (siguientes[slug]?.id === foto.id) {
        delete siguientes[slug];
      } else {
        siguientes[slug] = { id: foto.id, galeria: slug, encuadre: ENCUADRE_POR_DEFECTO };
      }
      return { ...a, galerias: siguientes };
    });
  }

  function moverInicio(encuadre: Encuadre) {
    cambiar((a) => (a.inicio ? { ...a, inicio: { ...a.inicio, encuadre } } : a));
  }

  function moverGaleria(slug: string, encuadre: Encuadre) {
    cambiar((a) => {
      const actual = a.galerias[slug];
      if (!actual) return a;
      return { ...a, galerias: { ...a.galerias, [slug]: { ...actual, encuadre } } };
    });
  }

  async function guardar() {
    setGuardando(true);
    setAviso("");
    try {
      const respuesta = await fetch("/api/panel/portadas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(elecciones),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error ?? "No se pudo guardar.");
      setAviso("Guardado. Ya se ve en la web.");
      setSinCambios(true);
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  const fotoDe = (eleccion?: Eleccion) =>
    eleccion ? fotosPorGaleria[eleccion.galeria]?.find((f) => f.id === eleccion.id) : undefined;

  return (
    <div className="space-y-8">
      <Bloque
        titulo="Portada del inicio"
        bajada="Es la foto grande que se ve al entrar a la web. Conviene una apaisada: entra entera."
      >
        <Editor
          foto={fotoDe(elecciones.inicio)}
          encuadre={elecciones.inicio?.encuadre}
          proporcion="16 / 9"
          alMover={moverInicio}
          alQuitar={() => cambiar((a) => ({ ...a, inicio: undefined }))}
        />
        <Elegibles
          fotos={todas}
          elegida={elecciones.inicio?.id}
          alElegir={(foto) => {
            const galeria =
              Object.entries(fotosPorGaleria).find(([, fs]) =>
                fs.some((f) => f.id === foto.id),
              )?.[0] ?? "";
            if (galeria) elegirInicio(foto, galeria);
          }}
        />
      </Bloque>

      {galerias.map((g) => (
        <Bloque
          key={g.slug}
          titulo={`Portada de ${g.nombre}`}
          bajada="Es la tarjeta que lleva a esta galería. El recuadro es vertical."
        >
          <Editor
            foto={fotoDe(elecciones.galerias[g.slug])}
            encuadre={elecciones.galerias[g.slug]?.encuadre}
            proporcion="3 / 4"
            ancho="max-w-[260px]"
            alMover={(e) => moverGaleria(g.slug, e)}
            alQuitar={() =>
              cambiar((a) => {
                const siguientes = { ...a.galerias };
                delete siguientes[g.slug];
                return { ...a, galerias: siguientes };
              })
            }
          />
          <Elegibles
            fotos={fotosPorGaleria[g.slug] ?? []}
            elegida={elecciones.galerias[g.slug]?.id}
            alElegir={(foto) => elegirGaleria(g.slug, foto)}
          />
        </Bloque>
      ))}

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-dorado/20 bg-negro/95 py-4 backdrop-blur">
        <button
          onClick={guardar}
          disabled={guardando || sinCambios}
          className="bg-dorado px-8 py-3 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {guardando ? "Guardando…" : "Guardar portadas"}
        </button>
        {aviso && <span className="text-sm text-texto-tenue">{aviso}</span>}
      </div>
    </div>
  );
}

/** Vista previa con la forma real del recuadro, más los controles para moverla. */
function Editor({
  foto,
  encuadre = ENCUADRE_POR_DEFECTO,
  proporcion,
  ancho = "",
  alMover,
  alQuitar,
}: {
  foto?: Foto;
  encuadre?: Encuadre;
  proporcion: string;
  ancho?: string;
  alMover: (encuadre: Encuadre) => void;
  alQuitar: () => void;
}) {
  if (!foto) {
    return (
      <p className="mb-5 border border-dashed border-dorado/25 px-4 py-6 text-center text-xs text-texto-tenue">
        Sin elegir: la web muestra una foto automáticamente.
      </p>
    );
  }

  return (
    <div className="mb-5">
      <div
        className={`relative overflow-hidden border border-dorado/40 ${ancho}`}
        style={{ aspectRatio: proporcion }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto.miniatura}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: aPosicionCss(encuadre) }}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Deslizador
          etiqueta="Mover de arriba a abajo"
          valor={encuadre.y}
          alCambiar={(y) => alMover({ ...encuadre, y })}
          izquierda="Arriba"
          derecha="Abajo"
        />
        <Deslizador
          etiqueta="Mover de izquierda a derecha"
          valor={encuadre.x}
          alCambiar={(x) => alMover({ ...encuadre, x })}
          izquierda="Izquierda"
          derecha="Derecha"
        />
      </div>

      <button
        type="button"
        onClick={alQuitar}
        className="mt-3 text-xs tracking-[0.15em] text-texto-tenue uppercase transition-colors hover:text-dorado"
      >
        Volver a la automática
      </button>
    </div>
  );
}

function Deslizador({
  etiqueta,
  valor,
  alCambiar,
  izquierda,
  derecha,
}: {
  etiqueta: string;
  valor: number;
  alCambiar: (valor: number) => void;
  izquierda: string;
  derecha: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs tracking-[0.2em] text-texto-tenue uppercase">
        {etiqueta}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(valor * 100)}
        onChange={(e) => alCambiar(Number(e.target.value) / 100)}
        className="w-full accent-[#c9a24a]"
      />
      <span className="mt-1 flex justify-between text-[0.65rem] text-texto-tenue">
        <span>{izquierda}</span>
        <span>{derecha}</span>
      </span>
    </label>
  );
}

function Elegibles({
  fotos,
  elegida,
  alElegir,
}: {
  fotos: Foto[];
  elegida?: string;
  alElegir: (foto: Foto) => void;
}) {
  if (fotos.length === 0) {
    return (
      <p className="text-xs text-texto-tenue">
        Esta galería todavía no tiene fotos cargadas.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {fotos.map((foto) => (
        <button
          key={foto.id}
          type="button"
          onClick={() => alElegir(foto)}
          title={foto.ancho > foto.alto ? "Apaisada" : "Vertical"}
          className={`relative aspect-square overflow-hidden border transition-colors ${
            elegida === foto.id ? "border-dorado" : "border-transparent hover:border-dorado/50"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.miniatura} alt="" className="h-full w-full object-cover" />
          {foto.ancho > foto.alto && (
            <span className="absolute right-1 bottom-1 bg-black/70 px-1 text-[0.55rem] text-dorado">
              ▭
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function Bloque({
  titulo,
  bajada,
  children,
}: {
  titulo: string;
  bajada: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-dorado/15 bg-negro-suave p-6">
      <h2 className="titulo text-xl text-dorado">{titulo}</h2>
      <p className="mt-1 mb-5 text-xs leading-relaxed text-texto-tenue">{bajada}</p>
      {children}
    </section>
  );
}
