import Link from "next/link";
import { Sky } from "@/components/village/Sky";

/** Marco común de las pantallas de acceso (cielo de la hora + panel pixel). */
export function Shell({ title, kicker, children, back = true }: { title: string; kicker?: string; children: React.ReactNode; back?: boolean }) {
  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden pb-36">
      <Sky />
      <div className="relative z-10 mx-auto max-w-md px-4 pt-6">
        {back && (
          <Link href="/" className="px-chip mb-4">
            ← Volver a la aldea
          </Link>
        )}
        <section className="px-box anim-pop p-5">
          {kicker && (
            <span className="px-chip mb-2" style={{ ["--chip" as string]: "var(--mint)" }}>
              {kicker}
            </span>
          )}
          <h1 className="font-pixel text-[1.9rem] leading-tight">{title}</h1>
          <div className="mt-4">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function Cargando({ texto = "Cargando expediente…" }: { texto?: string }) {
  return <p className="font-pixel text-[var(--ink-soft)]" style={{ animation: "glow-pulse 1.2s steps(3) infinite" }}>{texto}</p>;
}
