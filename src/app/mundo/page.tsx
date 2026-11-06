import type { Metadata } from "next";
import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { Mundo } from "@/components/mundo/Mundo";
import { esSala } from "@/features/mundo/mapas";
import { conTope, db, hasDatabase } from "@/lib/server/db";
import { realtimeConfig } from "@/lib/server/mundo";
import { estadoDe, jugadorActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Snowville" };

export default function MundoPage({ searchParams }: PageProps<"/mundo">) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#1b1730]">
          <p className="font-pixel text-lg text-[var(--cream)]">Abriendo Snowville…</p>
        </div>
      }
    >
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: { searchParams: PageProps<"/mundo">["searchParams"] }) {
  const sp = await searchParams;
  const salaInicial = esSala(sp.sala) ? sp.sala : "snowville";
  let yo = null;
  let color: string | null = null;
  try {
    yo = hasDatabase() ? await jugadorActual() : null;
    if (yo?.teamId) {
      const [t] = await conTope(db()`select color from cc.teams where id = ${yo.teamId}`);
      color = (t?.color as string) ?? null;
    }
  } catch (e) {
    unstable_rethrow(e);
    console.error("[mundo]", e);
  }
  const puede = yo && (yo.status === "active" || yo.status === "pending");
  const estado = yo ? estadoDe(yo) : null;
  return (
    <Mundo
      salaInicial={salaInicial}
      realtime={puede ? realtimeConfig() : null}
      jugador={
        puede && yo
          ? {
              id: yo.id,
              nombre: yo.displayName,
              avatar: yo.avatar,
              color,
              pendiente: yo.status === "pending",
              seasonId: yo.seasonId,
              dia: estado?.fase === "en-curso" ? estado.dia : 0,
              prueba: yo.prueba,
              admin: yo.role === "admin" && yo.status === "active",
            }
          : null
      }
    />
  );
}
