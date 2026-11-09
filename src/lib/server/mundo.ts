import "server-only";
import { avatarValido } from "@/features/avatar";
import { filtrarChat } from "@/features/contenido/filtro";
import { esSala, type SalaId } from "@/features/mundo/mapas";
import { ErrorDeUsuario } from "./api";
import { conTope, db } from "./db";
import { permitir } from "./limites";
import type { Jugador } from "./sesion";

/** Canal de una sala: el id de temporada (UUID) hace que nadie de afuera lo adivine. */
export function topicoSala(seasonId: string, salaId: SalaId) {
  return `snow:${seasonId}:${salaId}`;
}

export function realtimeConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

/** Difunde un evento desde el servidor (REST de Supabase Realtime). Si falla, no rompe nada. */
async function difundir(topico: string, evento: string, payload: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return false;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ messages: [{ topic: topico, event: evento, payload, private: false }] }),
      signal: ctrl.signal,
    });
    return r.ok;
  } catch (e) {
    console.error("[mundo] no se pudo difundir", e);
    return false;
  } finally {
    clearTimeout(t);
  }
}

export interface MensajeChat {
  id: string;
  playerId: string;
  nombre: string;
  texto: string;
  fecha: string;
}

export async function enviarChat(yo: Jugador, salaId: unknown, entrada: string): Promise<{ mensaje: MensajeChat; difundido: boolean }> {
  if (yo.status !== "active" && yo.status !== "pending") throw new ErrorDeUsuario("Tu acceso está pausado.", 403);
  if (!esSala(salaId)) throw new ErrorDeUsuario("Sala desconocida.");
  if (!(await permitir(`chat:${yo.id}`, 8, 60))) throw new ErrorDeUsuario("Vas muy rápido con el chat. Espera un momento.", 429);
  const f = filtrarChat(entrada);
  if (!f.ok) throw new ErrorDeUsuario(f.motivo);
  const [m] = await conTope(db()`
    insert into cc.world_messages (season_id, player_id, room, body) values (${yo.seasonId}, ${yo.id}, ${salaId}, ${f.texto})
    returning id, created_at
  `);
  const mensaje: MensajeChat = { id: m.id, playerId: yo.id, nombre: yo.displayName, texto: f.texto, fecha: new Date(m.created_at).toISOString() };
  const difundido = await difundir(topicoSala(yo.seasonId, salaId), "chat", { ...mensaje });
  return { mensaje, difundido };
}

export async function chatReciente(seasonId: string, salaId: SalaId, limite = 15): Promise<MensajeChat[]> {
  const rows = await conTope(() => db()`
    select m.id, m.player_id, p.display_name, m.body, m.created_at
    from cc.world_messages m join cc.players p on p.id = m.player_id
    where m.season_id = ${seasonId} and m.room = ${salaId} and not m.hidden and m.created_at > now() - interval '2 days'
    order by m.created_at desc limit ${limite}
  `);
  return rows.reverse().map((r) => ({ id: r.id, playerId: r.player_id, nombre: r.display_name, texto: r.body, fecha: new Date(r.created_at).toISOString() }));
}

export async function reportar(yo: Jugador, tipo: unknown, id: string, motivo: string) {
  if (tipo !== "message" && tipo !== "player") throw new ErrorDeUsuario("Reporte inválido.");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ErrorDeUsuario("Reporte inválido.");
  const m = motivo.trim().slice(0, 140) || "Sin motivo";
  if (!(await permitir(`reporte:${yo.id}`, 10, 3600))) throw new ErrorDeUsuario("Demasiados reportes seguidos.", 429);
  await conTope(db()`
    insert into cc.moderation_reports (season_id, reporter_id, target_type, target_id, reason)
    values (${yo.seasonId}, ${yo.id}, ${tipo}, ${id}, ${m.length < 2 ? "Sin motivo" : m})
    on conflict (reporter_id, target_type, target_id) do nothing
  `);
}

/** Perfil público de otro jugador de la MISMA temporada. */
export async function perfilPublico(yo: Jugador, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ErrorDeUsuario("Jugador no encontrado.", 404);
  const [r] = await conTope(() => db()`
    select p.id, p.display_name, p.avatar, p.status, t.name as team, t.color, t.emblem,
           coalesce(v.monedas, 0)::int as monedas
    from cc.players p
    left join cc.teams t on t.id = p.team_id
    left join cc.v_totals v on v.player_id = p.id
    where p.id = ${id} and p.season_id = ${yo.seasonId} and p.status in ('active', 'pending')
  `);
  if (!r) throw new ErrorDeUsuario("Jugador no encontrado.", 404);
  return {
    id: r.id as string,
    nombre: r.display_name as string,
    avatar: avatarValido(r.avatar),
    pendiente: r.status === "pending",
    equipo: r.team ? { nombre: r.team as string, color: r.color as string, emblema: r.emblem as string } : null,
    monedas: r.monedas as number,
  };
}
