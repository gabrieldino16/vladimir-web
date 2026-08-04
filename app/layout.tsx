import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

// Serif elegante para títulos y sans geométrica para el cuerpo: acompañan la
// estética de la tarjeta (negro y dorado) sin competir con las fotos.
const titulo = Cormorant_Garamond({
  variable: "--font-titulo",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const cuerpo = Jost({
  variable: "--font-cuerpo",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nombre} | Fotografía y video`,
    template: `%s | ${site.nombre}`,
  },
  description: site.descripcion,
  openGraph: {
    title: `${site.nombre} | Fotografía y video`,
    description: site.descripcion,
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${titulo.variable} ${cuerpo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
