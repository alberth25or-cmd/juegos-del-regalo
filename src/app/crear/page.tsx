import type { Metadata } from "next";
import { Shell } from "@/components/acceso/Shell";
import { CrearGrupoForm } from "@/components/acceso/Formularios";

export const metadata: Metadata = { title: "Crear grupo" };

export default function CrearPage() {
  return (
    <Shell title="Crea tu grupo" kicker="Organizador">
      <p className="mb-4 text-[0.95rem] text-[var(--ink-soft)]">
        Tú también juegas. Al terminar te daremos el enlace para invitar a tus amigos por WhatsApp.
      </p>
      <CrearGrupoForm />
    </Shell>
  );
}
