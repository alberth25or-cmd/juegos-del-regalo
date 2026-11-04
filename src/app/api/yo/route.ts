import { connection } from "next/server";
import { agenteActual } from "@/lib/server/sesion";
import { rankingDelGrupo } from "@/lib/server/consultas";

/** Datos mínimos del agente de esta sesión para la portada (cabecera y píldoras). */
export async function GET() {
  await connection();
  try {
    const yo = await agenteActual();
    if (!yo) return Response.json({ agente: null }, { headers: { "cache-control": "no-store" } });

    let points = 0;
    let rank: number | null = null;
    let agentes = 0;
    if (yo.status === "approved") {
      const ranking = await rankingDelGrupo(yo.groupId);
      agentes = ranking.length;
      const mine = ranking.find((r) => r.memberId === yo.id);
      points = mine?.points ?? 0;
      rank = mine?.rank ?? null;
    }
    return Response.json(
      {
        agente: {
          codename: yo.codename,
          avatar: yo.avatar,
          role: yo.role,
          status: yo.status,
          groupName: yo.groupName,
          points,
          rank,
          agentes,
        },
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    console.error("[api/yo]", err);
    return Response.json({ agente: null, error: true }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}
