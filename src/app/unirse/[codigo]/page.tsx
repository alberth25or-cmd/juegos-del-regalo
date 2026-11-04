import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cargando, Shell } from "@/components/acceso/Shell";
import { UnirseForm } from "@/components/acceso/Formularios";
import { grupoPorInvitacion } from "@/lib/server/consultas";
import { agenteActual } from "@/lib/server/sesion";

export const metadata: Metadata = { title: "Unirse al grupo" };

export default function UnirsePage({ params }: PageProps<"/unirse/[codigo]">) {
  return (
    <Shell title="Te invitaron a jugar" kicker="Invitación">
      <Suspense fallback={<Cargando texto="Buscando tu grupo…" />}>
        <Contenido params={params} />
      </Suspense>
    </Shell>
  );
}

async function Contenido({ params }: { params: PageProps<"/unirse/[codigo]">["params"] }) {
  const { codigo } = await params;
  const [grupo, yo] = await Promise.all([grupoPorInvitacion(codigo), agenteActual()]);

  if (!grupo) {
    return <p>Esta invitación no existe o está mal escrita. Pídele el enlace de nuevo al organizador.</p>;
  }
  if (yo && yo.groupId === grupo.id) {
    return (
      <div className="flex flex-col gap-3">
        <p>
          Ya eres parte de <b>{grupo.name}</b> como <b>{yo.codename}</b>.
        </p>
        <Link href="/" className="px-btn" style={{ ["--bg" as string]: "var(--gold)" }}>
          Ir a la aldea
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="px-box mb-5 px-4 py-3" style={{ ["--bg" as string]: "var(--cream-2)" }}>
        <p className="font-pixel text-xl">{grupo.name}</p>
        <p className="px-hint">{grupo.agentes} agente(s) ya están dentro</p>
      </div>
      <UnirseForm codigo={codigo} grupo={grupo.name} />
    </>
  );
}
