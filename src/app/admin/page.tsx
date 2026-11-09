import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EnlaceInvitacion } from "@/components/acceso/Formularios";
import { PanelAdmin } from "@/components/admin/PanelAdmin";
import { Aviso, Cargando, Pantalla } from "@/components/ui/Pantalla";
import { diaLocal } from "@/features/season/calendario";
import { equiposDeTemporada, jugadoresDeTemporada, metricas } from "@/lib/server/consultas";
import { hasDatabase } from "@/lib/server/db";
import { estadoDe, jugadorActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Panel del organizador" };

export default function AdminPage() {
  return (
    <Pantalla title="Panel del organizador" kicker="Centro de mando" npc="santa" ancho="lg">
      <Suspense fallback={<Cargando texto="Abriendo el expediente…" />}>
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
        No has iniciado sesión.{" "}
        <Link href="/entrar" className="font-pixel underline">
          Entrar
        </Link>
      </p>
    );
  }
  if (yo.role !== "admin") return <p>Esta sala es solo para el organizador. El Auditor ya anotó tu visita. 🕶️</p>;

  const [jugadores, equipos, m] = await Promise.all([jugadoresDeTemporada(yo.seasonId, false), equiposDeTemporada(yo.seasonId), metricas(yo.seasonId)]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-pixel text-xl">
          {yo.seasonName}
          {yo.prueba ? " · 🧪 prueba" : ""}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Metrica t="Activos" v={m.activos} />
          <Metrica t="Pendientes" v={m.pendientes} />
          <Metrica t="Jugaron hoy" v={m.jugaron_hoy} />
          <Metrica t="Partidas" v={m.partidas} />
          <Metrica t="Rechazadas" v={m.rechazadas} />
          <Metrica t="Abandonadas" v={m.abandonadas} />
        </div>
      </div>
      <div>
        <p className="font-pixel text-lg">Enlace de invitación</p>
        <EnlaceInvitacion codigo={yo.inviteCode} compacto />
      </div>
      <PanelAdmin
        yoId={yo.id}
        jugadores={jugadores.map((j) => ({ id: j.id, username: j.username, displayName: j.displayName, avatar: j.avatar, role: j.role, status: j.status, teamId: j.teamId, monedas: j.monedas }))}
        equipos={equipos}
        desde={diaLocal(yo.startsAt)}
        hasta={diaLocal(yo.endsAt)}
        prueba={yo.prueba ? simulacion(estadoDe(yo)) : null}
      />
    </div>
  );
}

function simulacion(e: ReturnType<typeof estadoDe>) {
  return e.fase === "pretemporada" ? { dia: 1, total: 30 } : { dia: e.dia, total: e.totalDias };
}

function Metrica({ t, v }: { t: string; v: number }) {
  return (
    <div className="px-box px-2 py-2" style={{ ["--bg" as string]: "var(--cream-2)", margin: 2 }}>
      <div className="font-pixel text-xl tabular-nums">{v}</div>
      <div className="text-[0.68rem] text-[var(--ink-soft)]">{t}</div>
    </div>
  );
}
