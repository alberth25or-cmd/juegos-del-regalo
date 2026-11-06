import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Votacion } from "@/components/social/Votacion";
import { Aviso, Cargando, Pantalla } from "@/components/ui/Pantalla";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual } from "@/lib/server/sesion";
import { estadoVotacion } from "@/lib/server/votacion";

export const metadata: Metadata = { title: "¿Quién es más probable…?" };

export default function VotacionPage() {
  return (
    <Pantalla title="¿Quién es más probable…?" kicker="Tablón del Caos" back="/mundo?sala=tablon">
      <Suspense fallback={<Cargando texto="El Auditor está preparando la urna…" />}>
        <Contenido />
      </Suspense>
    </Pantalla>
  );
}

async function Contenido() {
  if (!hasDatabase()) return <Aviso tono="error">El juego todavía no tiene base de datos configurada.</Aviso>;
  const yo = await jugadorActual();
  if (!yo) {
    return (
      <p>
        Las votaciones son para los jugadores de la temporada.{" "}
        <Link href="/entrar" className="font-pixel underline">
          Entra con tu usuario
        </Link>
      </p>
    );
  }
  const estado = await estadoVotacion(yo);
  return <Votacion inicial={estado} yo={yo.id} />;
}
