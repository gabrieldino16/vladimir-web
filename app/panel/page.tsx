import type { Metadata } from "next";
import { haySesion } from "@/lib/auth";
import { Login } from "@/components/panel/Login";
import { Panel } from "@/components/panel/Panel";
import { packs, itemsDisponibles, grupos } from "@/lib/packs";
import { tiposDeEvento } from "@/lib/site";
import { fotosDeTodasLasGalerias, leerPortadas } from "@/lib/portadas-servidor";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

/** Panel privado del fotógrafo: presupuestos y fotos de portada. */
export default async function PaginaPanel() {
  if (!(await haySesion())) {
    return <Login />;
  }

  const [fotosPorGaleria, portadas] = await Promise.all([
    fotosDeTodasLasGalerias(),
    leerPortadas(),
  ]);

  return (
    <Panel
      packs={packs}
      grupos={grupos}
      itemsDisponibles={itemsDisponibles}
      galerias={tiposDeEvento.map((t) => ({ slug: t.slug, nombre: t.nombre }))}
      fotosPorGaleria={fotosPorGaleria}
      portadas={portadas}
    />
  );
}
