import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BotonSalir, PerfilForm } from "@/components/perfil/PerfilForm";
import { Avatar } from "@/components/rpg/PixelSprite";
import { Aviso, Cargando, Pantalla } from "@/components/ui/Pantalla";
import { equiposDeTemporada, jugadoresDeTemporada } from "@/lib/server/consultas";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Tu perfil" };

export default function PerfilPage() {
  return (
    <Pantalla title="Tu perfil" kicker="Personaje y ajustes" npc="muneco">
      <Suspense fallback={<Cargando />}>
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
  const [equipos, jugadores] = await Promise.all([equiposDeTemporada(yo.seasonId), jugadoresDeTemporada(yo.seasonId)]);
  const equipo = equipos.find((e) => e.id === yo.teamId);
  const companeros = equipo ? jugadores.filter((j) => j.teamId === equipo.id) : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="px-box px-3 py-2" style={{ ["--bg" as string]: "var(--cream-2)" }}>
        <p className="font-pixel">
          @{yo.username} · {yo.seasonName}
        </p>
        <p className="px-hint">Para entrar desde otro celular usa este usuario y tu PIN.</p>
      </div>

      <div className="px-box p-3">
        <p className="font-pixel text-lg">Tu equipo</p>
        {equipo ? (
          <>
            <p className="mt-1">
              <span className="px-chip" style={{ ["--chip" as string]: equipo.color, color: "#fff" }}>
                {equipo.emblem} {equipo.name}
              </span>
            </p>
            <ul className="mt-2 flex flex-wrap gap-3">
              {companeros.map((c) => (
                <li key={c.id} className="flex flex-col items-center text-[0.75rem]">
                  <Avatar config={c.avatar} size={34} />
                  <span className="max-w-[72px] truncate">{c.displayName}</span>
                  <span className="font-pixel">🪙 {c.monedas}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="px-hint mt-1">El organizador todavía no arma los equipos.</p>
        )}
      </div>

      <PerfilForm
        inicial={{ displayName: yo.displayName, avatar: yo.avatar, humorLevel: yo.humorLevel, allowRoast: yo.allowRoast, allowPublicSharing: yo.allowPublicSharing }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/reglas" className="text-[0.85rem] underline">
          Reglas y privacidad
        </Link>
        <BotonSalir />
      </div>
    </div>
  );
}
