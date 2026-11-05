import type { Metadata } from "next";
import { CrearTemporadaForm } from "@/components/acceso/Formularios";
import { Pantalla } from "@/components/ui/Pantalla";

export const metadata: Metadata = { title: "Crear temporada" };

export default function CrearPage() {
  return (
    <Pantalla title="Crear temporada" kicker="Para el organizador" npc="santa">
      <p className="mb-4 text-[0.95rem]">
        Creas Snowville para tu grupo, te vuelves el organizador y recibes un enlace para invitar a tus amigos. Tú apruebas a cada uno.
      </p>
      <CrearTemporadaForm />
    </Pantalla>
  );
}
