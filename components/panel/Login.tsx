"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";

export function Login() {
  const [estado, setEstado] = useState<"listo" | "entrando" | "error">("listo");
  const [error, setError] = useState("");

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("entrando");
    setError("");

    const datos = Object.fromEntries(new FormData(evento.currentTarget));

    try {
      const respuesta = await fetch("/api/panel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error || "No se pudo entrar");
      // Recarga para que el servidor ya vea la sesión y muestre el panel.
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo entrar");
      setEstado("error");
    }
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center">
          <Logo className="h-16 text-dorado" />
          <p className="mt-6 text-xs tracking-[0.35em] text-texto-tenue uppercase">
            Panel privado
          </p>
        </div>

        <form
          onSubmit={entrar}
          className="space-y-5 border border-dorado/20 bg-negro-suave p-8"
        >
          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.2em] text-texto-tenue uppercase">
              Usuario
            </span>
            <input
              name="usuario"
              required
              autoComplete="username"
              className="w-full border border-dorado/25 bg-negro px-4 py-3 text-texto outline-none focus:border-dorado"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.2em] text-texto-tenue uppercase">
              Contraseña
            </span>
            <input
              name="clave"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-dorado/25 bg-negro px-4 py-3 text-texto outline-none focus:border-dorado"
            />
          </label>

          {estado === "error" && (
            <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={estado === "entrando"}
            className="w-full bg-dorado px-8 py-3.5 text-sm tracking-[0.2em] text-negro uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {estado === "entrando" ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
