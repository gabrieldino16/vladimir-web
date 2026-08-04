"use client";

import { useState } from "react";
import { tiposDeEvento } from "@/lib/site";

/**
 * Formulario de contacto. Se usa igual en la página de contacto y en la del
 * beneficio; `esBeneficio` cambia el texto del botón y marca el email para que
 * el fotógrafo distinga los reclamos de la tarjeta.
 */
export function Formulario({
  esBeneficio = false,
  textoBoton = "Enviar consulta",
}: {
  esBeneficio?: boolean;
  textoBoton?: string;
}) {
  const [estado, setEstado] = useState<"listo" | "enviando" | "ok" | "error">("listo");
  const [mensajeError, setMensajeError] = useState("");

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("enviando");
    setMensajeError("");

    const datos = Object.fromEntries(new FormData(evento.currentTarget));

    try {
      const respuesta = await fetch("/api/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, esBeneficio }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error || "Error al enviar");
      setEstado("ok");
    } catch (error) {
      setMensajeError(
        error instanceof Error ? error.message : "No pudimos enviar el formulario.",
      );
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="border border-dorado/40 bg-negro-suave px-6 py-14 text-center">
        <p className="titulo dorado text-3xl">¡Listo!</p>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-texto-tenue">
          {esBeneficio
            ? "Recibimos tu solicitud. Vladimir se va a contactar con vos para coordinar y aplicar tu beneficio."
            : "Recibimos tu consulta. Te vamos a responder a la brevedad."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5 text-left">
      {/* Campo trampa para robots: invisible para las personas. */}
      <input
        type="text"
        name="web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etiqueta="Nombre y apellido *" nombre="nombre" requerido />
        <Campo etiqueta="Email *" nombre="email" tipo="email" requerido />
        <Campo etiqueta="Teléfono / WhatsApp" nombre="telefono" tipo="tel" />
        <Campo etiqueta="Fecha del evento" nombre="fechaEvento" tipo="date" />
      </div>

      <label className="block">
        <span className="mb-2 block text-xs tracking-[0.2em] text-texto-tenue uppercase">
          Tipo de evento
        </span>
        <select
          name="tipoEvento"
          defaultValue=""
          className="w-full border border-dorado/25 bg-negro px-4 py-3 text-texto outline-none transition-colors focus:border-dorado"
        >
          <option value="">Elegí una opción</option>
          {tiposDeEvento.map((t) => (
            <option key={t.slug} value={t.nombre}>
              {t.nombre}
            </option>
          ))}
          <option value="Otro">Otro</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs tracking-[0.2em] text-texto-tenue uppercase">
          Mensaje
        </span>
        <textarea
          name="mensaje"
          rows={4}
          placeholder="Contame un poco sobre tu evento..."
          className="w-full resize-y border border-dorado/25 bg-negro px-4 py-3 text-texto placeholder:text-texto-tenue/50 outline-none transition-colors focus:border-dorado"
        />
      </label>

      {estado === "error" && (
        <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {mensajeError}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="w-full bg-dorado px-8 py-4 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {estado === "enviando" ? "Enviando..." : textoBoton}
      </button>
    </form>
  );
}

function Campo({
  etiqueta,
  nombre,
  tipo = "text",
  requerido = false,
}: {
  etiqueta: string;
  nombre: string;
  tipo?: string;
  requerido?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs tracking-[0.2em] text-texto-tenue uppercase">
        {etiqueta}
      </span>
      <input
        type={tipo}
        name={nombre}
        required={requerido}
        className="w-full border border-dorado/25 bg-negro px-4 py-3 text-texto outline-none transition-colors focus:border-dorado"
      />
    </label>
  );
}
