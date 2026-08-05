"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Presupuestos } from "./Presupuestos";
import { Portadas } from "./Portadas";
import type { Item, Pack } from "@/lib/packs";
import type { Foto } from "@/lib/smugmug";
import type { Portadas as Elecciones } from "@/lib/portadas";

type Grupo = { id: Pack["grupo"]; nombre: string; bajada: string };
type Galeria = { slug: string; nombre: string };

type Seccion = "presupuestos" | "portadas";

/** Panel privado del fotógrafo, con sus dos herramientas. */
export function Panel({
  packs,
  grupos,
  itemsDisponibles,
  galerias,
  fotosPorGaleria,
  portadas,
}: {
  packs: Pack[];
  grupos: Grupo[];
  itemsDisponibles: Record<string, Item>;
  galerias: Galeria[];
  fotosPorGaleria: Record<string, Foto[]>;
  portadas: Elecciones;
}) {
  const [seccion, setSeccion] = useState<Seccion>("presupuestos");

  async function salir() {
    await fetch("/api/panel/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <main className="flex-1 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between border-b border-dorado/20 pb-6">
          <div className="flex items-center gap-4">
            <Logo className="h-11 text-dorado" />
            <div>
              <h1 className="titulo text-2xl">Panel privado</h1>
              <p className="text-xs tracking-[0.2em] text-texto-tenue uppercase">
                Vladimir Krauchuk
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

        <nav className="mb-10 flex gap-2">
          <Solapa activa={seccion === "presupuestos"} onClick={() => setSeccion("presupuestos")}>
            Presupuestos
          </Solapa>
          <Solapa activa={seccion === "portadas"} onClick={() => setSeccion("portadas")}>
            Fotos de portada
          </Solapa>
        </nav>

        {seccion === "presupuestos" ? (
          <Presupuestos
            packs={packs}
            grupos={grupos}
            itemsDisponibles={itemsDisponibles}
          />
        ) : (
          <Portadas
            galerias={galerias}
            fotosPorGaleria={fotosPorGaleria}
            iniciales={portadas}
          />
        )}
      </div>
    </main>
  );
}

function Solapa({
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
      className={`border px-6 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors ${
        activa
          ? "border-dorado bg-dorado text-negro"
          : "border-dorado/25 text-texto-tenue hover:border-dorado/60"
      }`}
    >
      {children}
    </button>
  );
}
