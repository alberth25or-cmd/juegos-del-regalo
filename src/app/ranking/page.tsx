import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Ranking } from "@/components/ranking/Ranking";
import { Aviso, Cargando, Pantalla } from "@/components/ui/Pantalla";
import { equiposDeTemporada, jugadoresDeTemporada, rankingAnonimo, rankingEquipos } from "@/lib/server/consultas";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Ranking" };

export default function RankingPage() {
  return (
    <Pantalla title="Ranking" kicker="En vivo" npc="auditor">
      <Suspense fallback={<Cargando texto="El Auditor está contando las monedas…" />}>
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
        El ranking es solo para jugadores.{" "}
        <Link href="/entrar" className="font-pixel underline">
          Entra con tu usuario
        </Link>
      </p>
    );
  }
  const [jugadores, equipos] = await Promise.all([jugadoresDeTemporada(yo.seasonId), equiposDeTemporada(yo.seasonId)]);
  return <Ranking inicial={{ ...rankingAnonimo(jugadores, yo.id), equipos: rankingEquipos(equipos, jugadores) }} />;
}
