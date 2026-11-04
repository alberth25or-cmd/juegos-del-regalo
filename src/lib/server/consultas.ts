import "server-only";
import { db } from "./db";

export interface FilaRanking {
  memberId: string;
  codename: string;
  avatar: string;
  points: number;
  rank: number;
}

/** Ranking del grupo, siempre derivado del libro de puntos. */
export async function rankingDelGrupo(groupId: string): Promise<FilaRanking[]> {
  const rows = await db()`
    select member_id, codename, avatar, points,
           rank() over (order by points desc)::int as rank
    from jdr.v_ranking where group_id = ${groupId}
    order by points desc, codename asc
  `;
  return rows.map((r) => ({ memberId: r.member_id, codename: r.codename, avatar: r.avatar, points: r.points, rank: r.rank }));
}

export async function grupoPorInvitacion(codigo: string) {
  const [g] = await db()`
    select g.id, g.name, g.status,
           (select count(*)::int from jdr.members m where m.group_id = g.id and m.status = 'approved') as agentes
    from jdr.groups g where g.invite_code = ${codigo.toUpperCase()}
  `;
  return g ? { id: g.id as string, name: g.name as string, status: g.status as string, agentes: g.agentes as number } : null;
}

export interface FilaAgente {
  id: string;
  alias: string;
  codename: string;
  avatar: string;
  role: string;
  status: string;
  paid: boolean;
  createdAt: Date;
}

export async function agentesDelGrupo(groupId: string): Promise<FilaAgente[]> {
  const rows = await db()`
    select id, alias, codename, avatar, role, status, paid, created_at
    from jdr.members where group_id = ${groupId}
    order by case status when 'pending' then 0 when 'approved' then 1 else 2 end, created_at
  `;
  return rows.map((r) => ({
    id: r.id,
    alias: r.alias,
    codename: r.codename,
    avatar: r.avatar,
    role: r.role,
    status: r.status,
    paid: r.paid,
    createdAt: r.created_at,
  }));
}
