import type { Metadata } from "next";
import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { Memory } from "@/components/games/Memory";
import { Cargando, Pantalla } from "@/components/ui/Pantalla";
import { misStats } from "@/lib/server/consultas";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Memory Gifts" };

export default function MemoryPage() {
  return (
    <Pantalla title="Memory Gifts" kicker="Arcade · Memoria del desastre" back="/mundo?sala=arcade">
      <Suspense fallback={<Cargando texto="Barajando el inventario…" />}>
        <Juego />
      </Suspense>
    </Pantalla>
  );
}

async function Juego() {
  let yo = null;
  try {
    yo = hasDatabase() ? await jugadorActual() : null;
  } catch (e) {
    unstable_rethrow(e);
    console.error("[memory]", e);
  }
  if (!yo) return <Memory modo="practica" stats={null} aviso="Modo demo: juega sin cuenta. Para ganar monedas necesitas una invitación." />;
  if (yo.status !== "active") return <Memory modo="practica" stats={null} aviso="Práctica: cuando el organizador te apruebe, tus partidas se guardarán." />;
  const s = await misStats(yo.id, "memory");
  return <Memory modo="real" stats={{ record: s.record, mejorHoy: s.mejorHoy, monedasHoy: s.monedasHoy }} />;
}
