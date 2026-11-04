import Link from "next/link";
import { notFound } from "next/navigation";
import { Sky } from "@/components/village/Sky";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { mockGroup, mockRanking } from "@/lib/mock";

const SECCIONES: Record<string, { title: string; subtitle: string }> = {
  reto: { title: "Misión del día", subtitle: "Foto misión · +10 puntos" },
  ranking: { title: "Tablero de la plaza", subtitle: "Ranking en vivo" },
  amigo: { title: "Buzón secreto", subtitle: "Tu expediente clasificado" },
  pozo: { title: "Cofre del pozo", subtitle: `S/ ${mockGroup.pot} · ${mockGroup.paid}/${mockGroup.members} pagaron` },
  fotos: { title: "Muro de fotos", subtitle: "Galería anónima" },
  tienda: { title: "Tienda de comodines", subtitle: "Apuestas y comodines" },
  calendario: { title: "Árbol del adviento", subtitle: `Día ${mockGroup.day} de ${mockGroup.totalDays}` },
};

export function generateStaticParams() {
  return Object.keys(SECCIONES).map((seccion) => ({ seccion }));
}

export default async function Seccion({ params }: PageProps<"/[seccion]">) {
  const { seccion } = await params;
  const s = SECCIONES[seccion];
  if (!s) notFound();

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden pb-32">
      <Sky />
      <div className="relative z-10 mx-auto max-w-md px-4 pt-6">
        <Link href="/" className="px-chip mb-4">
          ← Volver a la aldea
        </Link>
        <section className="px-box anim-pop p-5">
          <h1 className="font-pixel text-3xl leading-tight">{s.title}</h1>
          <p className="mt-1 text-[var(--ink-soft)]">{s.subtitle}</p>

          {seccion === "ranking" ? (
            <ol className="mt-4 flex flex-col gap-2">
              {mockRanking.map((r, i) => (
                <li key={r.id} className="px-box flex items-center gap-3 px-3 py-2" style={{ ["--bg" as string]: i === 3 ? "var(--cream-2)" : "#fff" }}>
                  <span className="w-6 font-pixel text-xl tabular-nums">{i + 1}</span>
                  <span className="h-8 w-8" style={{ background: r.color, boxShadow: "0 0 0 2px var(--ink)" }} aria-hidden />
                  <span className="flex-1 font-pixel">{r.codename}</span>
                  <span className="text-xs" style={{ color: r.move > 0 ? "var(--pine)" : r.move < 0 ? "var(--cherry)" : "var(--ink-soft)" }}>
                    {r.move > 0 ? `▲${r.move}` : r.move < 0 ? `▼${-r.move}` : "—"}
                  </span>
                  <span className="flex items-center gap-1 font-pixel tabular-nums">
                    <PixelIcon name="coin" size={16} /> {r.points}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 flex items-center gap-2 font-pixel text-[var(--ink-soft)]">
              <PixelIcon name="sparkle" size={18} /> Esta sala se abre en la próxima etapa.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
