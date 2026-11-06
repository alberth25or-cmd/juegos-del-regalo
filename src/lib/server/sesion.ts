import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { conTope, db, hasDatabase, type Sql, type Tx } from "./db";
import { hashLookup, newSessionToken } from "./seguridad";
import { estadoConPrueba } from "@/features/season/calendario";

/**
 * Sesión del jugador: token aleatorio en una cookie httpOnly que dura 60 días.
 * En la BD solo guardamos su HMAC, así que ver la BD no sirve para entrar como nadie.
 */

export const COOKIE = "jdr_cc";
const DURACION_SEG = 60 * 60 * 24 * 60;

export interface Jugador {
  id: string;
  seasonId: string;
  seasonName: string;
  inviteCode: string;
  username: string;
  displayName: string;
  avatar: Record<string, string>;
  role: "player" | "admin";
  status: "pending" | "active" | "inactive" | "rejected";
  teamId: string | null;
  humorLevel: "light" | "friends" | "chaos";
  allowRoast: boolean;
  allowPublicSharing: boolean;
  startsAt: Date;
  endsAt: Date;
  /** temporada de prueba: sin topes diarios y con día simulado */
  prueba: boolean;
  diaSimulado: number | null;
}

/** Día de temporada del jugador (respeta la simulación de las temporadas de prueba). */
export function estadoDe(yo: Jugador, ahora = new Date()) {
  return estadoConPrueba(ahora, yo.startsAt, yo.endsAt, yo.prueba, yo.diaSimulado);
}

/** Crea una sesión para el jugador y deja la cookie en este dispositivo. */
export async function iniciarSesion(playerId: string, sql: Sql | Tx = db()) {
  const token = newSessionToken();
  const ua = (await headers()).get("user-agent")?.slice(0, 200) ?? null;
  await conTope(sql`insert into cc.sessions (player_id, token_hash, user_agent) values (${playerId}, ${hashLookup(token)}, ${ua})`);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEG,
  });
}

/** Jugador de esta sesión (una sola consulta por request gracias a `cache`). */
export const jugadorActual = cache(async (): Promise<Jugador | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !hasDatabase()) return null;
  const hash = hashLookup(token);
  const rows = await conTope(
    db()`
      select p.id, p.season_id, s.name as season_name, s.invite_code, p.username, p.display_name, p.avatar,
             p.role, p.status, p.team_id, p.humor_level, p.allow_roast, p.allow_public_sharing,
             s.starts_at, s.ends_at, s.settings,
             (ss.last_used_at < now() - interval '10 minutes') as renovar
      from cc.sessions ss
      join cc.players p on p.id = ss.player_id
      join cc.seasons s on s.id = p.season_id
      where ss.token_hash = ${hash} and ss.expires_at > now()
    `,
    undefined,
    "lectura de sesión",
  );
  const r = rows[0];
  if (!r || r.status === "rejected") return null;
  if (r.renovar) {
    // Marca de "visto" sin frenar la respuesta.
    after(async () => {
      try {
        const sql = db();
        await conTope(sql`update cc.sessions set last_used_at = now(), expires_at = now() + interval '60 days' where token_hash = ${hash}`);
        await conTope(sql`update cc.players set last_seen_at = now() where id = ${r.id}`);
      } catch (e) {
        console.error("[sesion] no se pudo renovar", e);
      }
    });
  }
  return {
    id: r.id,
    seasonId: r.season_id,
    seasonName: r.season_name,
    inviteCode: r.invite_code,
    username: r.username,
    displayName: r.display_name,
    avatar: r.avatar ?? {},
    role: r.role,
    status: r.status,
    teamId: r.team_id,
    humorLevel: r.humor_level,
    allowRoast: r.allow_roast,
    allowPublicSharing: r.allow_public_sharing,
    startsAt: new Date(r.starts_at),
    endsAt: new Date(r.ends_at),
    prueba: r.settings?.prueba === true,
    diaSimulado: typeof r.settings?.diaSimulado === "number" ? r.settings.diaSimulado : null,
  };
});

/** Cierra la sesión de este dispositivo. */
export async function cerrarSesion() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && hasDatabase()) {
    await conTope(db()`delete from cc.sessions where token_hash = ${hashLookup(token)}`);
  }
  jar.delete(COOKIE);
}
