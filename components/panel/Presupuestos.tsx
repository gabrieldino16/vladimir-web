"use client";

import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { generarPresupuesto } from "@/lib/pdf";
import type { Item, Pack } from "@/lib/packs";

type Grupo = { id: Pack["grupo"]; nombre: string; bajada: string };

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
    });
  }

  async function salir() {
    await fetch("/api/panel/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <main className="flex-1 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between border-b border-dorado/20 pb-6">
          <div className="flex items-center gap-4">
            <Logo className="h-11 text-dorado" />
            <div>
              <h1 className="titulo text-2xl">Presupuestos</h1>
              <p className="text-xs tracking-[0.2em] text-texto-tenue uppercase">
                Panel privado
              </p>
            </div>
          </div>
          <button
            onClick={salir}
            className="text-xs tracking-[0.2em] text-texto-tenue uppercase transition-colors hover:text-dorado"
          >
            Salir
          </button>
        </header>

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
                    <option>15 años</option>
                    <option>Casamiento</option>
                    <option>Evento empresarial</option>
                    <option>Otro</option>
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
            <div className="border border-dorado/25 bg-negro-suave p-6">
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
          </aside>
        </div>
      </div>
    </main>
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
