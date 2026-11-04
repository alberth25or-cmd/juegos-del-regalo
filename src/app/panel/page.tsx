import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cargando, Shell } from "@/components/acceso/Shell";
import { EnlaceInvitacion, NuevoCodigo } from "@/components/acceso/Panel";
import { agentesDelGrupo } from "@/lib/server/consultas";
import { agenteActual } from "@/lib/server/sesion";
import { decidirAgente, salir } from "@/lib/server/acciones";

export const metadata: Metadata = { title: "Panel del organizador" };

export default function PanelPage() {
  return (
    <Shell title="Panel del organizador" kicker="Centro de mando">
      <Suspense fallback={<Cargando />}>
        <Contenido />
      </Suspense>
    </Shell>
  );
}

const ESTADO: Record<string, { texto: string; color: string }> = {
  pending: { texto: "Pendiente", color: "var(--gold)" },
  approved: { texto: "Aprobado", color: "var(--mint)" },
  rejected: { texto: "Rechazado", color: "#e8d9dc" },
};

async function Contenido() {
  const yo = await agenteActual();
  if (!yo) {
    return (
      <p>
        No has iniciado sesión.{" "}
        <Link href="/entrar" className="font-pixel underline">
          Entrar con tu código
        </Link>
      </p>
    );
  }
  if (yo.role !== "organizer") {
    return <p>Esta sala es solo para el organizador del grupo, agente {yo.codename}. 🕶️</p>;
  }

  const agentes = await agentesDelGrupo(yo.groupId);
  const pendientes = agentes.filter((a) => a.status === "pending").length;
  const aprobados = agentes.filter((a) => a.status === "approved").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-pixel text-xl">{yo.groupName}</p>
        <p className="px-hint">
          {aprobados} aprobado(s) · {pendientes} pendiente(s)
        </p>
      </div>

      <EnlaceInvitacion inviteCode={yo.inviteCode} grupo={yo.groupName} />

      <div>
        <p className="font-pixel mb-2">Agentes</p>
        <ul className="flex flex-col gap-2">
          {agentes.map((a) => (
            <li key={a.id} className="px-box flex flex-wrap items-center gap-2 px-3 py-2" style={{ ["--bg" as string]: "#fff" }}>
              <span className="text-2xl" aria-hidden>
                {a.avatar}
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block font-pixel">{a.codename}</span>
                <span className="block text-[0.75rem] text-[var(--ink-soft)]">
                  {a.alias}
                  {a.role === "organizer" ? " · organizador" : ""}
                </span>
              </span>
              <span className="px-chip" style={{ ["--chip" as string]: ESTADO[a.status]?.color }}>
                {ESTADO[a.status]?.texto ?? a.status}
              </span>
              {a.status === "pending" && (
                <span className="flex w-full gap-2">
                  <form action={decidirAgente} className="flex-1">
                    <input type="hidden" name="memberId" value={a.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <button type="submit" className="px-btn w-full !min-h-[40px] !text-[0.9rem]" style={{ ["--bg" as string]: "var(--mint)" }}>
                      ✓ Aprobar
                    </button>
                  </form>
                  <form action={decidirAgente}>
                    <input type="hidden" name="memberId" value={a.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button type="submit" className="px-btn !min-h-[40px] !text-[0.9rem]" style={{ ["--bg" as string]: "#f3c9d1" }}>
                      ✕
                    </button>
                  </form>
                </span>
              )}
              {a.status === "approved" && a.id !== yo.id && <NuevoCodigo memberId={a.id} />}
            </li>
          ))}
        </ul>
        <p className="px-hint mt-2">Aprueba solo a quienes conoces: así nadie se cuela con perfiles falsos.</p>
      </div>

      <form action={salir}>
        <button type="submit" className="px-chip">
          Cerrar sesión en este celular
        </button>
      </form>
    </div>
  );
}
