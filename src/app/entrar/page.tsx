import type { Metadata } from "next";
import { EntrarForm } from "@/components/acceso/Formularios";
import { Pantalla } from "@/components/ui/Pantalla";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <Pantalla back="/" title="Entrar" kicker="Otro celular" npc="auditor">
      <p className="mb-4 text-[0.95rem]">Escribe el usuario y el PIN que creaste al unirte. Quedarás conectado en este celular por 60 días.</p>
      <EntrarForm />
    </Pantalla>
  );
}
