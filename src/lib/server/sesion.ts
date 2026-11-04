import "server-only";
import { cookies, headers } from "next/headers";
import { db, hasDatabase } from "./db";
import { hashLookup, newSessionToken } from "./seguridad";

/**
 * Sesión del agente: un token aleatorio en una cookie protegida (httpOnly).
 * En la base de datos solo guardamos su hash, así que robar la BD no sirve
 * para entrar como nadie.
 */

const COOKIE = "jdr_sesion";
const UN_ANIO = 60 * 60 * 24 * 365;

export interface Agente {
  id: string;
  alias: string;
  codename: string;
  avatar: string;
  role: "organizer" | "player";
  status: "pending" | "approved" | "rejected";
  groupId: string;
  groupName: string;
  inviteCode: string;
}

/** Crea una sesión nueva para el agente y deja la cookie en este dispositivo. */
export async function iniciarSesion(memberId: string) {
  const token = newSessionToken();
  const ua = (await headers()).get("user-agent")?.slice(0, 200) ?? null;
  await db()`insert into jdr.sessions (member_id, token_hash, user_agent) values (${memberId}, ${hashLookup(token)}, ${ua})`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UN_ANIO,
  });
}

/** Agente de esta sesión, o null si no hay sesión válida. */
export async function agenteActual(): Promise<Agente | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !hasDatabase()) return null;
  const rows = await db()`
    with s as (
      update jdr.sessions set last_used_at = now()
      where token_hash = ${hashLookup(token)}
      returning member_id
    )
    select m.id, m.alias, m.codename, m.avatar, m.role, m.status,
           g.id as group_id, g.name as group_name, g.invite_code
    from s
    join jdr.members m on m.id = s.member_id
    join jdr.groups g on g.id = m.group_id
  `;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    alias: r.alias,
    codename: r.codename,
    avatar: r.avatar,
    role: r.role,
    status: r.status,
    groupId: r.group_id,
    groupName: r.group_name,
    inviteCode: r.invite_code,
  };
}

/** Cierra la sesión de este dispositivo. */
export async function cerrarSesion() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && hasDatabase()) {
    await db()`delete from jdr.sessions where token_hash = ${hashLookup(token)}`;
  }
  jar.delete(COOKIE);
}
