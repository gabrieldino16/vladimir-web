"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const enlaces = [
  { href: "/galerias", texto: "Galerías" },
  { href: "/packs", texto: "Servicios" },
  { href: "/sobre-mi", texto: "Sobre mí" },
  { href: "/contacto", texto: "Contacto" },
];

export function Header() {
  const [scrolleado, setScrolleado] = useState(false);
  const [abierto, setAbierto] = useState(false);

  // La barra arranca transparente sobre la foto de portada y se vuelve sólida
  // al bajar, para que los enlaces se lean siempre.
  useEffect(() => {
    const alScrollear = () => setScrolleado(window.scrollY > 40);
    alScrollear();
    window.addEventListener("scroll", alScrollear, { passive: true });
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolleado || abierto
          ? "bg-negro/95 backdrop-blur border-b border-dorado/20"
          : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="h-10 text-dorado transition-opacity hover:opacity-80"
          aria-label="Inicio"
        >
          <Logo className="h-full" />
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="relative text-sm tracking-[0.18em] uppercase text-texto-tenue transition-colors hover:text-dorado"
              >
                {e.texto}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="text-dorado md:hidden"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            {abierto ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {abierto && (
        <ul className="flex flex-col gap-1 border-t border-dorado/15 px-5 pb-5 md:hidden">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                onClick={() => setAbierto(false)}
                className="block py-3 text-sm tracking-[0.18em] uppercase text-texto-tenue hover:text-dorado"
              >
                {e.texto}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
