"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { generarPresupuesto, PROPORCION_PORTADA } from "@/lib/pdf";
import {
  FOCO_POR_DEFECTO,
  focoSugerido,
  leerArchivo,
  recortarParaPortada,
} from "@/lib/foto-portada";
import type { Item, Pack } from "@/lib/packs";

type Grupo = { id: Pack["grupo"]; nombre: string; bajada: string };

type FotoSugerida = { id: string; miniatura: string; grande: string };

/**
 * Tipos de evento del presupuesto. El "slug" es la galería de la que se
 * proponen fotos para la portada; "Otro" no tiene galería asociada.
 *
 * Van en singular porque el presupuesto es de un evento puntual, por eso no se
 * toman directamente de `tiposDeEvento`. Si se agrega uno allá, sumarlo acá.
 */
const OPCIONES_EVENTO = [
  { nombre: "15 años", slug: "15-anios" },
  { nombre: "Sesión de fotos", slug: "sesiones" },
  { nombre: "Casamiento", slug: "casamientos" },
  { nombre: "Evento empresarial", slug: "eventos-empresariales" },
  { nombre: "Otro", slug: "" },
] as const;

export function Presupuestos({
  packs,
  grupos,
  itemsDisponibles,
}: {
  packs: Pack[];
  grupos: Grupo[];
  itemsDisponibles: Record<string, Item>;
}) {
  const [cliente, setCliente] = useState("");
  const [tipoEvento, setTipoEvento] = useState("15 años");
  const [fechaEvento, setFechaEvento] = useState("");
  const [packId, setPackId] = useState<string>(packs[0]?.id ?? "");
  const [personalizado, setPersonalizado] = useState(false);
  const [clavesElegidas, setClavesElegidas] = useState<string[]>([]);
  const [precioPersonalizado, setPrecioPersonalizado] = useState<number>(0);
  const [nombrePersonalizado, setNombrePersonalizado] = useState("Pack personalizado");
  const [observaciones, setObservaciones] = useState("");
  const [moneda, setMoneda] = useState("USD");
  const [validezDias, setValidezDias] = useState(15);
  const [aviso, setAviso] = useState("");

  // Portada: las fotos sugeridas salen de la galería del tipo de evento, pero
  // también se puede subir una del evento del cliente.
  const [sugeridas, setSugeridas] = useState<FotoSugerida[]>([]);
  // Se guarda la foto entera y el recorte por separado: así mover el encuadre
  // no obliga a volver a bajarla.
  const [fotoEntera, setFotoEntera] = useState<string>("");
  const [foco, setFoco] = useState(FOCO_POR_DEFECTO);
  const [portada, setPortada] = useState<string>("");
  const [idPortada, setIdPortada] = useState<string>("");
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const archivoRef = useRef<HTMLInputElement>(null);

  // Rehace el recorte cada vez que cambia la foto o el encuadre.
  useEffect(() => {
    if (!fotoEntera) {
      setPortada("");
      return;
    }
    let vigente = true;
    recortarParaPortada(fotoEntera, PROPORCION_PORTADA, foco)
      .then((recorte) => {
        if (vigente) setPortada(recorte);
      })
      .catch(() => {
        if (vigente) setAviso("No se pudo preparar la foto.");
      });
    return () => {
      vigente = false;
    };
  }, [fotoEntera, foco]);

  const galeriaDelEvento =
    OPCIONES_EVENTO.find((o) => o.nombre === tipoEvento)?.slug ?? "";

  useEffect(() => {
    if (!galeriaDelEvento) {
      setSugeridas([]);
      return;
    }
    let vigente = true;
    fetch(`/api/panel/fotos?galeria=${galeriaDelEvento}`)
      .then((r) => (r.ok ? r.json() : { fotos: [] }))
      .then((d) => {
        if (vigente) setSugeridas(d.fotos ?? []);
      })
      .catch(() => {
        if (vigente) setSugeridas([]);
      });
    return () => {
      vigente = false;
    };
  }, [galeriaDelEvento]);

  async function elegirSugerida(foto: FotoSugerida) {
    if (idPortada === foto.id) {
      quitarPortada();
      return;
    }
    setCargandoFoto(true);
    setAviso("");
    try {
      const r = await fetch(
        `/api/panel/fotos?imagen=${encodeURIComponent(foto.grande)}`,
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "No se pudo traer la foto.");
      await usarFoto(d.dataUrl, foto.id);
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se pudo usar esa foto.");
    } finally {
      setCargandoFoto(false);
    }
  }

  async function subirFoto(archivo?: File) {
    if (!archivo) return;
    setCargandoFoto(true);
    setAviso("");
    try {
      await usarFoto(await leerArchivo(archivo), "propia");
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se pudo leer la foto.");
    } finally {
      setCargandoFoto(false);
    }
  }

  /** Deja la foto lista con su encuadre inicial ya calculado. */
  async function usarFoto(entera: string, id: string) {
    setFoco(await focoSugerido(entera, PROPORCION_PORTADA));
    setFotoEntera(entera);
    setIdPortada(id);
  }

  function quitarPortada() {
    setFotoEntera("");
    setPortada("");
    setIdPortada("");
    setFoco(FOCO_POR_DEFECTO);
    if (archivoRef.current) archivoRef.current.value = "";
  }

  const packElegido = useMemo(
    () => packs.find((p) => p.id === packId),
    [packs, packId],
  );

  const items = personalizado
    ? clavesElegidas.map((c) => itemsDisponibles[c])
    : (packElegido?.items ?? []);
  const precio = personalizado ? precioPersonalizado : (packElegido?.precio ?? 0);
  const nombrePack = personalizado
    ? nombrePersonalizado
    : `${grupos.find((g) => g.id === packElegido?.grupo)?.nombre ?? ""} — ${packElegido?.nombre ?? ""}`;

  function alternarItem(clave: string) {
    setClavesElegidas((actuales) =>
      actuales.includes(clave)
        ? actuales.filter((c) => c !== clave)
        : [...actuales, clave],
    );
  }

  function descargar() {
    if (!cliente.trim()) {
      setAviso("Poné el nombre del cliente.");
      return;
    }
    if (items.length === 0) {
      setAviso("Elegí al menos un servicio.");
      return;
    }
    setAviso("");
    generarPresupuesto({
      cliente: cliente.trim(),
      tipoEvento,
      fechaEvento,
      nombrePack,
      items,
      precio,
      moneda,
      observaciones,
      validezDias,
      fotoPortada: portada || undefined,
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* ------------------------------------------------------ formulario */}
          <div className="space-y-8">
            <Bloque titulo="Datos del cliente">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Nombre del cliente">
                  <input
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Ej. Familia Pérez"
                    className={entrada}
                  />
                </Campo>
                <Campo etiqueta="Tipo de evento">
                  <select
                    value={tipoEvento}
                    onChange={(e) => setTipoEvento(e.target.value)}
                    className={entrada}
                  >
                    {OPCIONES_EVENTO.map((o) => (
                      <option key={o.nombre}>{o.nombre}</option>
                    ))}
                  </select>
                </Campo>
                <Campo etiqueta="Fecha del evento">
                  <input
                    type="date"
                    value={fechaEvento}
                    onChange={(e) => setFechaEvento(e.target.value)}
                    className={entrada}
                  />
                </Campo>
                <Campo etiqueta="Validez (días)">
                  <input
                    type="number"
                    min={1}
                    value={validezDias}
                    onChange={(e) => setValidezDias(Number(e.target.value))}
                    className={entrada}
                  />
                </Campo>
              </div>
            </Bloque>

            <Bloque titulo="Servicio">
              <div className="mb-5 flex gap-2">
                <Pestania activa={!personalizado} onClick={() => setPersonalizado(false)}>
                  Pack existente
                </Pestania>
                <Pestania activa={personalizado} onClick={() => setPersonalizado(true)}>
                  Pack personalizado
                </Pestania>
              </div>

              {!personalizado ? (
                <div className="space-y-6">
                  {grupos.map((grupo) => (
                    <div key={grupo.id}>
                      <p className="mb-2 text-xs tracking-[0.2em] text-dorado uppercase">
                        {grupo.nombre}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {packs
                          .filter((p) => p.grupo === grupo.id)
                          .map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setPackId(p.id)}
                              className={`border px-4 py-3 text-left transition-colors ${
                                packId === p.id
                                  ? "border-dorado bg-dorado/10"
                                  : "border-dorado/20 hover:border-dorado/50"
                              }`}
                            >
                              <span className="block text-sm text-texto">{p.nombre}</span>
                              <span className="mt-1 block text-xs text-dorado">
                                USD {p.precio.toLocaleString("es-AR")}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo etiqueta="Nombre del pack">
                      <input
                        value={nombrePersonalizado}
                        onChange={(e) => setNombrePersonalizado(e.target.value)}
                        className={entrada}
                      />
                    </Campo>
                    <Campo etiqueta="Precio">
                      <input
                        type="number"
                        min={0}
                        value={precioPersonalizado}
                        onChange={(e) => setPrecioPersonalizado(Number(e.target.value))}
                        className={entrada}
                      />
                    </Campo>
                  </div>

                  <div>
                    <p className="mb-3 text-xs tracking-[0.2em] text-texto-tenue uppercase">
                      Servicios incluidos
                    </p>
                    <div className="space-y-2">
                      {Object.entries(itemsDisponibles).map(([clave, item]) => (
                        <label
                          key={clave}
                          className={`flex cursor-pointer gap-3 border p-3 transition-colors ${
                            clavesElegidas.includes(clave)
                              ? "border-dorado bg-dorado/5"
                              : "border-dorado/15 hover:border-dorado/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={clavesElegidas.includes(clave)}
                            onChange={() => alternarItem(clave)}
                            className="mt-1 accent-[#c9a24a]"
                          />
                          <span>
                            <span className="block text-sm text-texto">{item.titulo}</span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-texto-tenue">
                              {item.detalle}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Bloque>

            <Bloque titulo="Foto de portada">
              <p className="mb-4 text-xs leading-relaxed text-texto-tenue">
                Abre el presupuesto a página completa. Se puede elegir una de la
                galería o subir una foto del evento del cliente.
              </p>

              {portada ? (
                <div className="mb-4">
                  {/* Se muestra ya recortada: es exactamente lo que va al PDF. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portada}
                    alt="Portada elegida"
                    className="w-full border border-dorado/40"
                  />
                  {/* En una foto vertical entra sólo una franja: este control
                      elige cuál, para no cortar las caras. */}
                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs tracking-[0.2em] text-texto-tenue uppercase">
                      Encuadre
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(foco * 100)}
                      onChange={(e) => setFoco(Number(e.target.value) / 100)}
                      className="w-full accent-[#c9a24a]"
                    />
                    <span className="mt-1 flex justify-between text-[0.65rem] text-texto-tenue">
                      <span>Arriba de la foto</span>
                      <span>Abajo</span>
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={quitarPortada}
                    className="mt-3 text-xs tracking-[0.15em] text-texto-tenue uppercase transition-colors hover:text-dorado"
                  >
                    Quitar foto
                  </button>
                </div>
              ) : (
                <p className="mb-4 border border-dashed border-dorado/25 px-4 py-6 text-center text-xs text-texto-tenue">
                  Sin foto: la portada queda lisa, en negro.
                </p>
              )}

              {sugeridas.length > 0 && (
                <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {sugeridas.map((foto) => (
                    <button
                      key={foto.id}
                      type="button"
                      onClick={() => elegirSugerida(foto)}
                      className={`aspect-square overflow-hidden border transition-colors ${
                        idPortada === foto.id
                          ? "border-dorado"
                          : "border-transparent hover:border-dorado/50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={foto.miniatura}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => archivoRef.current?.click()}
                  className="border border-dorado/40 px-5 py-2 text-xs tracking-[0.15em] text-dorado uppercase transition-colors hover:bg-dorado hover:text-negro"
                >
                  Subir una foto
                </button>
                {cargandoFoto && (
                  <span className="text-xs text-texto-tenue">Preparando la foto…</span>
                )}
                <input
                  ref={archivoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => subirFoto(e.target.files?.[0])}
                  className="hidden"
                />
              </div>
            </Bloque>

            <Bloque titulo="Extras">
              <div className="space-y-4">
                <Campo etiqueta="Moneda">
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value)}
                    className={entrada}
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </Campo>
                <Campo etiqueta="Observaciones (opcional)">
                  <textarea
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Forma de pago, seña, condiciones particulares..."
                    className={`${entrada} resize-y`}
                  />
                </Campo>
              </div>
            </Bloque>
          </div>

          {/* ------------------------------------------------------ vista previa */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="border border-dorado/25 bg-negro-suave">
              {/* La vista previa imita la hoja: foto arriba, fundida al negro. */}
              {portada && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={portada} alt="" className="w-full" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-negro-suave" />
                </div>
              )}

              <div className="p-6">
              <p className="text-xs tracking-[0.25em] text-dorado uppercase">
                Vista previa
              </p>

              <h2 className="titulo mt-4 text-xl">{cliente || "Nombre del cliente"}</h2>
              <p className="mt-1 text-sm text-texto-tenue">
                {tipoEvento}
                {fechaEvento && ` · ${fechaEvento.split("-").reverse().join("/")}`}
              </p>

              <div className="filete my-5" />

              <p className="text-sm text-texto">{nombrePack}</p>
              <ul className="mt-3 space-y-1.5">
                {items.map((item) => (
                  <li key={item.titulo} className="flex gap-2 text-xs text-texto-tenue">
                    <span className="text-dorado">◆</span>
                    {item.titulo}
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="text-xs text-texto-tenue">Sin servicios elegidos</li>
                )}
              </ul>

              <div className="filete my-5" />

              <div className="flex items-baseline justify-between">
                <span className="text-xs tracking-[0.2em] text-texto-tenue uppercase">
                  Total
                </span>
                <span className="titulo dorado text-2xl">
                  {moneda} {precio.toLocaleString("es-AR")}
                </span>
              </div>

              {aviso && (
                <p className="mt-5 border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {aviso}
                </p>
              )}

              <button
                onClick={descargar}
                className="mt-6 w-full bg-dorado px-6 py-3.5 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90"
              >
                Descargar PDF
              </button>
              </div>
            </div>
          </aside>
    </div>
  );
}

const entrada =
  "w-full border border-dorado/25 bg-negro px-4 py-2.5 text-sm text-texto outline-none transition-colors focus:border-dorado";

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border border-dorado/15 bg-negro-suave p-6">
      <h2 className="titulo mb-5 text-xl text-dorado">{titulo}</h2>
      {children}
    </section>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs tracking-[0.2em] text-texto-tenue uppercase">
        {etiqueta}
      </span>
      {children}
    </label>
  );
}

function Pestania({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-5 py-2 text-xs tracking-[0.15em] uppercase transition-colors ${
        activa
          ? "border-dorado bg-dorado text-negro"
          : "border-dorado/25 text-texto-tenue hover:border-dorado/60"
      }`}
    >
      {children}
    </button>
  );
}
