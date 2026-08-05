"use client";

import { useEffect, useState } from "react";
import { Marco } from "./Marco";
import type { Foto } from "@/lib/smugmug";

/** Una foto de la rotación, con el encuadre que le corresponde. */
export type FotoDePortada = {
  foto: Foto;
  posicion?: string;
  posicionMovil?: string;
};

/**
 * Portada que va cambiando de foto mientras la persona mira la página.
 *
 * Las fotos se apilan una encima de otra y se cruzan con un fundido; no se
 * reemplaza el elemento, así el navegador no tiene que volver a decodificar la
 * imagen en cada vuelta y la transición sale pareja.
 *
 * Con una sola foto se comporta igual que antes: no hay nada que rotar.
 */
export function PortadaRotativa({
  fotos,
  intervalo = 6000,
  retraso = 0,
  medida = "miniatura",
  sizes,
  className = "",
}: {
  fotos: FotoDePortada[];
  /** Cuánto dura cada foto en pantalla. */
  intervalo?: number;
  /** Desfase inicial, para que varias portadas no cambien todas juntas. */
  retraso?: number;
  medida?: "miniatura" | "grande";
  sizes?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (fotos.length < 2) return;

    // Quien pidió menos animaciones en su sistema ve una sola foto, quieta.
    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (menosMovimiento.matches) return;

    let reloj: ReturnType<typeof setInterval>;
    const arranque = setTimeout(() => {
      reloj = setInterval(
        () => setVisible((actual) => (actual + 1) % fotos.length),
        intervalo,
      );
    }, retraso);

    return () => {
      clearTimeout(arranque);
      clearInterval(reloj);
    };
  }, [fotos.length, intervalo, retraso]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      {fotos.map((f, i) => (
        <div
          key={f.foto.id}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: i === visible ? 1 : 0 }}
          aria-hidden={i !== visible}
        >
          <Marco
            foto={f.foto}
            conIcono={false}
            medida={medida}
            sizes={sizes}
            posicion={f.posicion}
            posicionMovil={f.posicionMovil}
            // Solo la primera se carga con prioridad: las demás pueden esperar,
            // total no se ven hasta pasados unos segundos.
            prioridad={i === 0}
          />
        </div>
      ))}
    </div>
  );
}
