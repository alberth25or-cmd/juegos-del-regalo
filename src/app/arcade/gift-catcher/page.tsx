import type { Metadata } from "next";
import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { GiftCatcher } from "@/components/games/GiftCatcher";
import { Cargando, Pantalla } from "@/components/ui/Pantalla";
import { estadoTemporada } from "@/features/season/calendario";
import { AVATAR_POR_DEFECTO } from "@/features/avatar";
import { miGiftCatcher } from "@/lib/server/consultas";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Gift Catcher" };

export default function GiftCatcherPage() {
  return (
    <Pantalla title="Gift Catcher" kicker="Arcade · Santa en bancarrota" back="/mundo?sala=arcade">
      <Suspense fallback={<Cargando texto="Santa está cargando los regalos…" />}>
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
    console.error("[gift-catcher]", e);
  }
  if (!yo) {
    return <GiftCatcher modo="practica" avatar={AVATAR_POR_DEFECTO} stats={null} pretemporada={false} aviso="Modo demo: juega sin cuenta. Para guardar puntos necesitas una invitación." />;
  }
  if (yo.status !== "active") {
    return <GiftCatcher modo="practica" avatar={yo.avatar} stats={null} pretemporada={false} aviso="Práctica: cuando el organizador te apruebe, tus partidas se guardarán." />;
  }
  const stats = await miGiftCatcher(yo.id);
  const pretemporada = estadoTemporada(new Date(), yo.startsAt, yo.endsAt).fase === "pretemporada";
  return <GiftCatcher modo="real" avatar={yo.avatar} stats={{ record: stats.record, mejorHoy: stats.mejorHoy, puntosHoy: stats.puntosHoy }} pretemporada={pretemporada} />;
}
