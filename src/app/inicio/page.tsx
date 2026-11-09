import Link from "next/link";
import { Suspense } from "react";
import { redirect, unstable_rethrow } from "next/navigation";
import { Sky } from "@/components/village/Sky";
import { NpcSprite } from "@/components/rpg/PixelSprite";
import { APP_NAME } from "@/lib/config";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual } from "@/lib/server/sesion";

/**
 * Entrada con cuenta: qué es esto, cómo se juega y los botones para entrar o crear temporada.
 * La pantalla principal ("/") es la aldea de casas; si ya tienes sesión, vuelves ahí.
 */
export default function Inicio() {
  return (
    <main className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden px-4 py-10">
      <Sky />
      <Suspense fallback={null}>
        <SiTieneSesionAlMundo />
      </Suspense>
      <section className="px-box anim-pop relative z-10 w-full max-w-md p-6 text-center">
        <div className="flex items-end justify-center gap-1" aria-hidden>
          {(["duende", "rudolf", "santa", "auditor", "muneco"] as const).map((n, k) => (
            <span key={n} className="anim-bob" style={{ animationDelay: `${k * 0.18}s` }}>
              <NpcSprite id={n} size={n === "santa" ? 62 : 48} />
            </span>
          ))}
        </div>
        <h1 className="mt-3 font-pixel text-[2rem] leading-tight">{APP_NAME}</h1>
        <p className="font-pixel text-[0.95rem] text-[var(--cherry)]">Christmas Chaos · 25 nov → 24 dic</p>

        <ol className="mt-5 flex flex-col gap-2 text-left">
          {[
            ["🎟️", "Abre el enlace que te mandó el organizador y crea tu personaje."],
            ["🗺️", "Camina por Snowville con tus amigos: entra a las casas y habla con los personajes."],
            ["🎮", "Juega, coopera y vota. Gana el equipo con mejor promedio."],
          ].map(([e, t], i) => (
            <li key={i} className="flex items-start gap-3 rounded-sm bg-[var(--cream-2)] px-3 py-2 text-[0.92rem] leading-snug">
              <span className="text-xl" aria-hidden>
                {e}
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-col gap-2">
          <Link href="/entrar" className="px-btn shine" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
            Entrar con mi usuario
          </Link>
          <Link href="/mundo" className="px-btn" style={{ ["--bg" as string]: "var(--gold)" }}>
            Ver Snowville sin cuenta
          </Link>
        </div>
        <p className="mt-4 text-[0.82rem] text-[var(--ink-soft)]">
          ¿Eres el organizador?{" "}
          <Link href="/crear" className="underline">
            Crea una temporada
          </Link>{" "}
          ·{" "}
          <Link href="/reglas" className="underline">
            Reglas
          </Link>
        </p>
      </section>
    </main>
  );
}

/** Con sesión válida no hace falta esta pantalla: a la pantalla principal. */
async function SiTieneSesionAlMundo() {
  if (!hasDatabase()) return null;
  let entrar = false;
  try {
    const yo = await jugadorActual();
    entrar = !!yo && (yo.status === "active" || yo.status === "pending");
  } catch (e) {
    unstable_rethrow(e);
    console.error("[inicio]", e);
  }
  if (entrar) redirect("/");
  return null;
}
