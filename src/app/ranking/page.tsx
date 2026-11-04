import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cargando, Shell } from "@/components/acceso/Shell";
import { AutoRefresh } from "@/components/acceso/AutoRefresh";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { rankingDelGrupo } from "@/lib/server/consultas";
import { agenteActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Ranking" };

export default function RankingPage() {
  return (
    <Shell title="Tablero de la plaza" kicker="Ranking en vivo">
      <Suspense fallback={<Cargando texto="Contando puntos…" />}>
        <Contenido />
      </Suspense>
    </Shell>
  );
}

const MEDALLA = ["🥇", "🥈", "🥉"];

async function Contenido() {
  const yo = await agenteActual();
  if (!yo) {
    return (
      <div className="flex flex-col gap-3">
        <p>Para ver el ranking de tu grupo, únete con el enlace de invitación o entra con tu código.</p>
        <Link href="/entrar" className="px-btn" style={{ ["--bg" as string]: "var(--gold)" }}>
          Entrar con mi código
        </Link>
      </div>
    );
  }
  if (yo.status !== "approved") {
    return <p>⏳ Tu ingreso a <b>{yo.groupName}</b> está pendiente. Cuando el organizador te apruebe, aquí verás el ranking.</p>;
  }

  const filas = await rankingDelGrupo(yo.groupId);
  return (
    <>
      <AutoRefresh seconds={20} />
      <p className="px-hint mb-3">
        {yo.groupName} · se actualiza solo cada 20 segundos
      </p>
      <ol className="flex flex-col gap-2">
        {filas.map((r) => {
          const mio = r.memberId === yo.id;
          return (
            <li
              key={r.memberId}
              className="px-box flex items-center gap-3 px-3 py-2"
              style={{ ["--bg" as string]: mio ? "var(--cream-2)" : "#fff" }}
            >
              <span className="w-7 text-center font-pixel text-xl tabular-nums">{MEDALLA[r.rank - 1] ?? r.rank}</span>
              <span className="text-2xl" aria-hidden>
                {r.avatar}
              </span>
              <span className="flex-1 font-pixel">
                {r.codename}
                {mio && <span className="ml-1 text-[0.75rem] text-[var(--ink-soft)]">(tú)</span>}
              </span>
              <span className="flex items-center gap-1 font-pixel tabular-nums">
                <PixelIcon name="coin" size={16} /> {r.points}
              </span>
            </li>
          );
        })}
      </ol>
      {filas.every((f) => f.points === 0) && (
        <p className="px-hint mt-3">Todos empiezan en 0. Los puntos llegan con las misiones del día. 🍫</p>
      )}
    </>
  );
}
