import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Trivia } from "@/components/games/Trivia";
import { Aviso, Cargando, Pantalla } from "@/components/ui/Pantalla";
import { triviaEquiposHoy } from "@/lib/server/consultas";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Juicio del Polo Norte" };

export default function TriviaPage() {
  return (
    <Pantalla title="Juicio del Polo Norte" kicker="Arena · Trivia por equipos" back="/mundo?sala=arena">
      <Suspense fallback={<Cargando texto="El tribunal se está poniendo la toga…" />}>
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
        La trivia es para los jugadores de la temporada.{" "}
        <Link href="/entrar" className="font-pixel underline">
          Entra con tu usuario
        </Link>
      </p>
    );
  }
  const equipos = await triviaEquiposHoy(yo.seasonId);
  const activo = yo.status === "active";
  return <Trivia equiposIniciales={equipos} miEquipo={yo.teamId} activo={activo} aviso={activo ? undefined : "Cuando el organizador te apruebe, podrás jugar el juicio."} />;
}
