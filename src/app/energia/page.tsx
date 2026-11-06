import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Energia } from "@/components/social/Energia";
import { Aviso, Cargando, Pantalla } from "@/components/ui/Pantalla";
import { hasDatabase } from "@/lib/server/db";
import { energiaDe } from "@/lib/server/energia";
import { jugadorActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Energía navideña" };

export default function EnergiaPage() {
  return (
    <Pantalla title="Energía navideña" kicker="Misión de todos" back="/mundo">
      <Suspense fallback={<Cargando texto="Midiendo los voltios del árbol…" />}>
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
        La energía es de los jugadores de la temporada.{" "}
        <Link href="/entrar" className="font-pixel underline">
          Entra con tu usuario
        </Link>
      </p>
    );
  }
  return <Energia inicial={await energiaDe(yo.seasonId)} />;
}
