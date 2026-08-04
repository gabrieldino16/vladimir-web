import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/site";
import { IconoInstagram, IconoWhatsapp } from "./Iconos";

export function Footer() {
  return (
    <footer className="border-t border-dorado/15 bg-negro-suave">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <Link href="/" className="inline-block">
            <Logo className="h-20" conNombre />
            <span className="mt-2 block text-[0.6rem] tracking-[0.42em] text-texto-tenue">
              FOTO &amp; VIDEO
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-texto-tenue">
            {site.descripcion}
          </p>
        </div>

        <nav className="text-sm">
          <h3 className="titulo mb-4 text-lg text-dorado">Secciones</h3>
          <ul className="space-y-2 text-texto-tenue">
            <li><Link className="hover:text-dorado" href="/galerias">Galerías</Link></li>
            <li><Link className="hover:text-dorado" href="/packs">Servicios</Link></li>
            <li><Link className="hover:text-dorado" href="/sobre-mi">Sobre mí</Link></li>
            <li><Link className="hover:text-dorado" href="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        <div className="text-sm">
          <h3 className="titulo mb-4 text-lg text-dorado">Contacto</h3>
          <ul className="space-y-3 text-texto-tenue">
            <li>
              <a
                href={site.contacto.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-dorado"
              >
                <IconoInstagram className="h-4 w-4" />@{site.contacto.instagram}
              </a>
            </li>
            <li>
              <a
                href={site.contacto.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-dorado"
              >
                <IconoWhatsapp className="h-4 w-4" />
                {site.contacto.whatsappTexto}
              </a>
            </li>
            <li>{site.contacto.ciudad}</li>
          </ul>
        </div>
      </div>

      <div className="filete" />
      <p className="px-5 py-6 text-center text-xs tracking-wider text-texto-tenue">
        © {new Date().getFullYear()} {site.nombre} — Todos los derechos reservados
      </p>
    </footer>
  );
}
