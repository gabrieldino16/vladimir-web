import type { Metadata } from "next";
import { haySesion } from "@/lib/auth";
import { Login } from "@/components/panel/Login";
import { Presupuestos } from "@/components/panel/Presupuestos";
import { packs, itemsDisponibles, grupos } from "@/lib/packs";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

/** Panel privado del fotógrafo: generador de presupuestos en PDF. */
export default async function Panel() {
  if (!(await haySesion())) {
    return <Login />;
  }

  return (
    <Presupuestos
      packs={packs}
      grupos={grupos}
      itemsDisponibles={itemsDisponibles}
    />
  );
}
