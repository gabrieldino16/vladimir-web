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

/** Las portadas a pantalla completa; las demás son tarjetas verticales. */
type ClaveSuelta = "inicio" | "beneficio";

/**
 * Elección de las fotos de portada: la del inicio, la de la página del
 * beneficio y la de cada galería.
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
    setElecciones(actualizar);
    setSinCambios(false);
    setAviso("");
  }

  /** De qué galería salió una foto, para poder volver a encontrarla después. */
  function galeriaDe(foto: Foto) {
    return (
      Object.entries(fotosPorGaleria).find(([, fs]) => fs.some((f) => f.id === foto.id))?.[0] ?? ""
    );
  }

  function elegirSuelta(clave: ClaveSuelta, foto: Foto) {
    const galeria = galeriaDe(foto);
    if (!galeria) return;
    cambiar((a) => ({
      ...a,
      [clave]:
        a[clave]?.id === foto.id
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

  function moverSuelta(clave: ClaveSuelta, campo: "encuadre" | "encuadreMovil", valor: Encuadre) {
    cambiar((a) => (a[clave] ? { ...a, [clave]: { ...a[clave]!, [campo]: valor } } : a));
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

  /** Los dos bloques a pantalla completa comparten toda la interfaz. */
  const sueltas: { clave: ClaveSuelta; titulo: string; bajada: string }[] = [
    {
      clave: "inicio",
      titulo: "Portada del inicio",
      bajada:
        "Es la foto grande que se ve al entrar. Conviene una apaisada, y el encuadre se ajusta aparte para la computadora y para el celular.",
    },
    {
      clave: "beneficio",
      titulo: "Portada del beneficio",
      bajada:
        "El fondo de la página a la que lleva el QR de las tarjetas. Como arriba va el 20% OFF, conviene una foto sin mucho detalle en el centro.",
    },
  ];

  return (
    <div className="space-y-8">
      {sueltas.map(({ clave, titulo, bajada }) => (
        <Bloque key={clave} titulo={titulo} bajada={bajada}>
          <EditorPantallaCompleta
            foto={fotoDe(elecciones[clave])}
            encuadre={elecciones[clave]?.encuadre}
            encuadreMovil={elecciones[clave]?.encuadreMovil}
            alMover={(campo, valor) => moverSuelta(clave, campo, valor)}
            alQuitar={() => cambiar((a) => ({ ...a, [clave]: undefined }))}
          />
          <Elegibles
            fotos={todas}
            elegida={elecciones[clave]?.id}
            alElegir={(foto) => elegirSuelta(clave, foto)}
          />
        </Bloque>
      ))}

      {galerias.map((g) => (
        <Bloque
          key={g.slug}
          titulo={`Portada de ${g.nombre}`}
          bajada="Es la tarjeta que lleva a esta galería. El recuadro es vertical en cualquier pantalla, así que alcanza con un encuadre."
        >
          <EditorTarjeta
            foto={fotoDe(elecciones.galerias[g.slug])}
            encuadre={elecciones.galerias[g.slug]?.encuadre}
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

/**
 * Portada a pantalla completa: se previsualiza en las dos formas, porque en el
 * celular el recuadro pasa de ancho a alto y se ve una franja muy distinta.
 */
function EditorPantallaCompleta({
  foto,
  encuadre = ENCUADRE_POR_DEFECTO,
  encuadreMovil,
  alMover,
  alQuitar,
}: {
  foto?: Foto;
  encuadre?: Encuadre;
  encuadreMovil?: Encuadre;
  alMover: (campo: "encuadre" | "encuadreMovil", valor: Encuadre) => void;
  alQuitar: () => void;
}) {
  if (!foto) return <SinElegir />;

  // Mientras no se toque el del celular, sigue al de la computadora.
  const movil = encuadreMovil ?? encuadre;

  return (
    <div className="mb-5">
      <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
        <div>
          <Rotulo>En la computadora</Rotulo>
          <Vista foto={foto} encuadre={encuadre} proporcion="16 / 9" />
          <Controles encuadre={encuadre} alCambiar={(e) => alMover("encuadre", e)} />
        </div>

        <div>
          <Rotulo>En el celular</Rotulo>
          <Vista foto={foto} encuadre={movil} proporcion="9 / 16" />
          <Controles encuadre={movil} alCambiar={(e) => alMover("encuadreMovil", e)} />
        </div>
      </div>

      <Quitar onClick={alQuitar} />
    </div>
  );
}

/** Portada de galería: el recuadro es vertical en cualquier pantalla. */
function EditorTarjeta({
  foto,
  encuadre = ENCUADRE_POR_DEFECTO,
  alMover,
  alQuitar,
}: {
  foto?: Foto;
  encuadre?: Encuadre;
  alMover: (encuadre: Encuadre) => void;
  alQuitar: () => void;
}) {
  if (!foto) return <SinElegir />;

  return (
    <div className="mb-5 max-w-[260px]">
      <Vista foto={foto} encuadre={encuadre} proporcion="3 / 4" />
      <Controles encuadre={encuadre} alCambiar={alMover} />
      <Quitar onClick={alQuitar} />
    </div>
  );
}

function Vista({
  foto,
  encuadre,
  proporcion,
}: {
  foto: Foto;
  encuadre: Encuadre;
  proporcion: string;
}) {
  return (
    <div
      className="relative overflow-hidden border border-dorado/40"
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
  );
}

function Controles({
  encuadre,
  alCambiar,
}: {
  encuadre: Encuadre;
  alCambiar: (encuadre: Encuadre) => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      <Deslizador
        etiqueta="Arriba / abajo"
        valor={encuadre.y}
        alCambiar={(y) => alCambiar({ ...encuadre, y })}
      />
      <Deslizador
        etiqueta="Izquierda / derecha"
        valor={encuadre.x}
        alCambiar={(x) => alCambiar({ ...encuadre, x })}
      />
    </div>
  );
}

function Deslizador({
  etiqueta,
  valor,
  alCambiar,
}: {
  etiqueta: string;
  valor: number;
  alCambiar: (valor: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.65rem] tracking-[0.15em] text-texto-tenue uppercase">
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
    </label>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[0.65rem] tracking-[0.25em] text-dorado uppercase">{children}</p>
  );
}

function SinElegir() {
  return (
    <p className="mb-5 border border-dashed border-dorado/25 px-4 py-6 text-center text-xs text-texto-tenue">
      Sin elegir: la web muestra una foto automáticamente.
    </p>
  );
}

function Quitar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 text-xs tracking-[0.15em] text-texto-tenue uppercase transition-colors hover:text-dorado"
    >
      Volver a la automática
    </button>
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
    return <p className="text-xs text-texto-tenue">Esta galería todavía no tiene fotos cargadas.</p>;
  }

  return (
    <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-8">
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
