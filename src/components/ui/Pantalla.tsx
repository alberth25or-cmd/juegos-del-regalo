import Link from "next/link";
import { Sky } from "@/components/village/Sky";
import { NpcSprite } from "@/components/rpg/PixelSprite";
import type { NpcId } from "@/features/contenido/npcs";

/** Marco común de las pantallas internas: cielo de la hora + panel pixel. */
export function Pantalla({
  title,
  kicker,
  children,
  back = "/",
  ancho = "md",
  npc,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  back?: string | false;
  ancho?: "md" | "lg";
  npc?: NpcId;
}) {
  return (
    <main className="relative min-h-[100svh] w-full overflow-x-clip pb-36">
      <Sky />
      <div className={`relative z-10 mx-auto px-4 pt-6 ${ancho === "lg" ? "max-w-2xl" : "max-w-md"}`} style={{ paddingTop: "max(24px, env(safe-area-inset-top))" }}>
        {back && (
          <Link href={back} className="px-chip mb-4">
            ← Volver
          </Link>
        )}
        <section className="px-box anim-pop relative p-5">
          {npc && (
            <span className="absolute -top-10 right-3 anim-bob" aria-hidden>
              <NpcSprite id={npc} size={58} />
            </span>
          )}
          {kicker && (
            <span className="px-chip mb-2" style={{ ["--chip" as string]: "var(--mint)" }}>
              {kicker}
            </span>
          )}
          <h1 className="font-pixel text-[1.8rem] leading-tight">{title}</h1>
          <div className="mt-4">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <p className="font-pixel text-[var(--ink-soft)]" role="status" style={{ animation: "glow-pulse 1.2s steps(3) infinite" }}>
      {texto}
    </p>
  );
}

export function Aviso({ tono = "info", children }: { tono?: "info" | "error" | "ok"; children: React.ReactNode }) {
  const bg = tono === "error" ? "#f3c9d1" : tono === "ok" ? "var(--mint)" : "var(--cream-2)";
  return (
    <div className="px-box px-3 py-2 text-[0.9rem]" role={tono === "error" ? "alert" : "status"} style={{ ["--bg" as string]: bg }}>
      {children}
    </div>
  );
}
