import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UnirseForm } from "@/components/acceso/Formularios";
import { Aviso, Cargando, Pantalla } from "@/components/ui/Pantalla";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual } from "@/lib/server/sesion";
import { temporadaPorInvitacion } from "@/lib/server/temporada";

export const metadata: Metadata = { title: "Invitación" };

export default function InvitacionPage({ params }: PageProps<"/i/[codigo]">) {
  return (
    <Pantalla title="Te invitaron a Snowville" kicker="Invitación" npc="duende">
      <Suspense fallback={<Cargando texto="Buscando la temporada…" />}>
        <Contenido params={params} />
      </Suspense>
    </Pantalla>
  );
}

async function Contenido({ params }: { params: PageProps<"/i/[codigo]">["params"] }) {
  const { codigo } = await params;
  if (!hasDatabase()) return <Aviso tono="error">El juego todavía no tiene base de datos configurada.</Aviso>;
  const [temporada, yo] = await Promise.all([temporadaPorInvitacion(codigo), jugadorActual()]);
  if (!temporada) return <Aviso tono="error">Esta invitación no existe o está mal escrita. Pídele el enlace de nuevo al organizador.</Aviso>;
  if (yo && yo.seasonId === temporada.id) {
    return (
      <div className="flex flex-col gap-3">
        <p>
          Ya estás en <b>{temporada.name}</b> como <b>{yo.displayName}</b>.
        </p>
        <Link href="/" className="px-btn" style={{ ["--bg" as string]: "var(--gold)" }}>
          Ir a la plaza
        </Link>
      </div>
    );
  }
  return (
    <>
      <div className="px-box mb-5 px-4 py-3" style={{ ["--bg" as string]: "var(--cream-2)" }}>
        <p className="font-pixel text-xl">{temporada.name}</p>
        <p className="px-hint">
          {temporada.activos} jugador(es) ya están dentro · 25 nov → 24 dic
        </p>
      </div>
      <UnirseForm codigo={temporada.codigo} temporada={temporada.name} />
    </>
  );
}
