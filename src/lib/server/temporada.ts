import "server-only";
import { avatarValido } from "@/features/avatar";
import { EVENTOS_POR_DEFECTO, inicioDelDia } from "@/features/season/calendario";
import { EQUIPOS_POR_DEFECTO, repartirEquipos } from "@/features/teams/repartir";
import { ErrorDeUsuario } from "./api";
import { conTope, db, type Tx } from "./db";
import {
  PIN_LOCK_MINUTES,
  PIN_MAX_FAILS,
  hashPin,
  newInviteCode,
  normalizeInviteCode,
  normalizeUsername,
  validatePin,
  validateUsername,
  verifyPin,
} from "./seguridad";
import { iniciarSesion } from "./sesion";

/** Operaciones de temporada, ingreso y administración. Todas en el servidor. */

/** Pensado para 20 a 40 jugadores; se deja margen. Los rechazados no cuentan. */
const MAX_JUGADORES = 50;

export interface DatosJugador {
  username: string;
  displayName: string;
  avatar: unknown;
  pin: string;
  pin2: string;
}

function validarDatosJugador(d: DatosJugador) {
  const username = normalizeUsername(d.username);
  const errU = validateUsername(username);
  if (errU) throw new ErrorDeUsuario(errU);
  const displayName = d.displayName.trim().replace(/\s+/g, " ");
  if (displayName.length < 2 || displayName.length > 30) throw new ErrorDeUsuario("Tu nombre visible debe tener entre 2 y 30 letras.");
  const errP = validatePin(d.pin);
  if (errP) throw new ErrorDeUsuario(errP);
  if (d.pin !== d.pin2) throw new ErrorDeUsuario("Los dos PIN no coinciden.");
  return { username, displayName, avatar: avatarValido(d.avatar), pin: d.pin };
}

function esDuplicado(e: unknown, restriccion?: string) {
  const err = e as { code?: string; constraint_name?: string };
  return err?.code === "23505" && (!restriccion || err.constraint_name === restriccion);
}

function slug(nombre: string) {
  return (
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "temporada"
  );
}

// ------------------------------------------------------- crear temporada
export async function crearTemporada(input: { nombre: string; jugador: DatosJugador; prueba?: boolean }) {
  const nombre = input.nombre.trim().replace(/\s+/g, " ");
  if (nombre.length < 2 || nombre.length > 60) throw new ErrorDeUsuario("El nombre de la temporada debe tener entre 2 y 60 letras.");
  const j = validarDatosJugador(input.jugador);
  const pinHash = await hashPin(j.pin);
  const inicio = inicioDelDia("2026-11-25");
  const fin = new Date(inicioDelDia("2026-12-25").getTime() - 1000); // 24 dic 23:59:59 Lima

  const sql = db();
  const res = await conTope(
    sql.begin(async (tx) => {
      const invite = newInviteCode();
      const [s] = await tx`
        insert into cc.seasons (name, slug, description, starts_at, ends_at, invite_code, status, settings)
        values (${nombre}, ${`${slug(nombre)}-${invite.slice(0, 4).toLowerCase()}`}, ${"30 días para sobrevivir a la Navidad."},
                ${inicio}, ${fin}, ${invite}, 'active', ${tx.json({ equipos: 4, tamanoEquipo: 5, prueba: input.prueba === true, diaSimulado: input.prueba ? 1 : null })})
        returning id, invite_code
      `;
      for (const e of EQUIPOS_POR_DEFECTO) {
        await tx`insert into cc.teams (season_id, name, slug, color, emblem) values (${s.id}, ${e.name}, ${e.slug}, ${e.color}, ${e.emblem})`;
      }
      for (const ev of EVENTOS_POR_DEFECTO) {
        await tx`insert into cc.season_events (season_id, day, title, description, kind) values (${s.id}, ${ev.day}, ${ev.title}, ${ev.description}, ${ev.kind})`;
      }
      const [p] = await tx`
        insert into cc.players (season_id, username, display_name, avatar, role, status, pin_hash, approved_at)
        values (${s.id}, ${j.username}, ${j.displayName}, ${tx.json(j.avatar)}, 'admin', 'active', ${pinHash}, now())
        returning id
      `;
      await tx`insert into cc.admin_audit_log (season_id, actor_id, action) values (${s.id}, ${p.id}, 'crear_temporada')`;
      await tx`insert into cc.chaos_events (season_id, player_id, event_type, payload) values (${s.id}, ${p.id}, 'temporada_creada', ${tx.json({ nombre })})`;
      await iniciarSesion(p.id, tx);
      return { inviteCode: s.invite_code as string };
    }),
    12_000,
    "creación de la temporada",
  );
  return res;
}

// ---------------------------------------------------------- invitación
export async function temporadaPorInvitacion(codigo: string) {
  const c = normalizeInviteCode(codigo);
  if (c.length < 6) return null;
  const [s] = await conTope(db()`
    select s.id, s.name, s.status, s.starts_at, s.ends_at, (s.settings ? 'casas') as cerrada,
           (select count(*)::int from cc.players p where p.season_id = s.id and p.status = 'active') as activos
    from cc.seasons s where s.invite_code = ${c}
  `);
  return s ? { id: s.id as string, name: s.name as string, status: s.status as string, activos: s.activos as number, codigo: c, cerrada: s.cerrada === true } : null;
}

export async function unirse(input: { codigo: string; jugador: DatosJugador }) {
  const s = await temporadaPorInvitacion(input.codigo);
  if (!s) throw new ErrorDeUsuario("Esta invitación no existe. Pídele el enlace al organizador.", 404);
  if (s.status === "completed") throw new ErrorDeUsuario("Esta temporada ya terminó.");
  if (s.cerrada) throw new ErrorDeUsuario("El juego ya empezó y la puerta se cerró: ya no entran agentes nuevos.");
  const j = validarDatosJugador(input.jugador);
  const pinHash = await hashPin(j.pin);
  const sql = db();
  try {
    return await conTope(
      sql.begin(async (tx) => {
        const [{ total }] = await tx`select count(*)::int as total from cc.players where season_id = ${s.id} and status <> 'rejected'`;
        if (total >= MAX_JUGADORES) throw new ErrorDeUsuario("Esta temporada ya está llena.");
        const [p] = await tx`
          insert into cc.players (season_id, username, display_name, avatar, pin_hash)
          values (${s.id}, ${j.username}, ${j.displayName}, ${tx.json(j.avatar)}, ${pinHash})
          returning id
        `;
        await tx`insert into cc.chaos_events (season_id, player_id, event_type, payload, is_public) values (${s.id}, ${p.id}, 'jugador_pendiente', ${tx.json({ nombre: j.displayName })}, false)`;
        await iniciarSesion(p.id, tx);
        return { seasonName: s.name, username: j.username };
      }),
      12_000,
      "inscripción",
    );
  } catch (e) {
    if (esDuplicado(e, "players_season_id_username_key")) throw new ErrorDeUsuario("Ese usuario ya está tomado en esta temporada. Elige otro.");
    throw e;
  }
}

// ----------------------------------------------------- entrar (otro celular)
export async function entrar(input: { username: string; pin: string }) {
  const username = normalizeUsername(input.username);
  const generico = new ErrorDeUsuario("Usuario o PIN incorrecto.", 401);
  if (validateUsername(username) || !/^\d{4}$/.test(input.pin)) throw generico;
  const sql = db();
  const candidatos = await conTope(sql`
    select p.id, p.pin_hash, p.pin_failed, p.pin_locked_until, p.status
    from cc.players p join cc.seasons s on s.id = p.season_id
    where p.username = ${username} and p.status <> 'rejected' and s.status <> 'completed'
    order by coalesce((s.settings->>'prueba')::boolean, false) asc, p.created_at desc limit 5
  `);
  if (candidatos.length === 0) throw generico;
  for (const c of candidatos) {
    if (c.pin_locked_until && new Date(c.pin_locked_until) > new Date()) {
      const min = Math.ceil((new Date(c.pin_locked_until).getTime() - Date.now()) / 60000);
      throw new ErrorDeUsuario(`Demasiados intentos. Espera ${min} min y vuelve a probar, o pídele al organizador que reinicie tu PIN.`, 429);
    }
  }
  for (const c of candidatos) {
    if (await verifyPin(input.pin, c.pin_hash)) {
      await conTope(sql`update cc.players set pin_failed = 0, pin_locked_until = null, last_seen_at = now() where id = ${c.id}`);
      await iniciarSesion(c.id);
      return { ok: true };
    }
  }
  // Fallo: se cuenta en todas las cuentas con ese usuario (normalmente una).
  const c = candidatos[0];
  const fallos = c.pin_failed + 1;
  if (fallos >= PIN_MAX_FAILS) {
    await conTope(sql`update cc.players set pin_failed = 0, pin_locked_until = now() + make_interval(mins => ${PIN_LOCK_MINUTES}) where id = ${c.id}`);
    throw new ErrorDeUsuario(`PIN bloqueado ${PIN_LOCK_MINUTES} minutos por seguridad.`, 429);
  }
  await conTope(sql`update cc.players set pin_failed = ${fallos} where id = ${c.id}`);
  throw new ErrorDeUsuario(`Usuario o PIN incorrecto. Te quedan ${PIN_MAX_FAILS - fallos} intento(s).`, 401);
}

// ---------------------------------------------------------- administración
async function auditar(tx: Tx, seasonId: string, actorId: string, action: string, payload: Record<string, unknown> = {}) {
  await tx`insert into cc.admin_audit_log (season_id, actor_id, action, payload) values (${seasonId}, ${actorId}, ${action}, ${tx.json(payload as never)})`;
}

export async function decidirJugador(adminId: string, seasonId: string, playerId: string, decision: "active" | "rejected" | "inactive") {
  if (playerId === adminId) throw new ErrorDeUsuario("No puedes cambiar tu propio estado.");
  return conTope(
    db().begin(async (tx) => {
      const [p] = await tx`
        update cc.players set status = ${decision}, approved_at = case when ${decision} = 'active' then coalesce(approved_at, now()) else approved_at end,
               team_id = case when ${decision} = 'rejected' then null else team_id end
        where id = ${playerId} and season_id = ${seasonId}
        returning display_name
      `;
      if (!p) throw new ErrorDeUsuario("Jugador no encontrado.", 404);
      if (decision === "active") {
        await tx`insert into cc.chaos_events (season_id, player_id, event_type, payload) values (${seasonId}, ${playerId}, 'jugador_aprobado', ${tx.json({ nombre: p.display_name })})`;
      }
      if (decision === "rejected") await tx`delete from cc.sessions where player_id = ${playerId}`;
      await auditar(tx, seasonId, adminId, "decidir_jugador", { playerId, decision });
    }),
  );
}

export async function reiniciarPin(adminId: string, seasonId: string, playerId: string, pin: string) {
  const err = validatePin(pin);
  if (err) throw new ErrorDeUsuario(err);
  const hash = await hashPin(pin);
  return conTope(
    db().begin(async (tx) => {
      const [p] = await tx`
        update cc.players set pin_hash = ${hash}, pin_failed = 0, pin_locked_until = null
        where id = ${playerId} and season_id = ${seasonId} returning id
      `;
      if (!p) throw new ErrorDeUsuario("Jugador no encontrado.", 404);
      await tx`delete from cc.sessions where player_id = ${playerId}`;
      await auditar(tx, seasonId, adminId, "reiniciar_pin", { playerId });
    }),
  );
}

export async function asignarEquipo(adminId: string, seasonId: string, playerId: string, teamId: string | null) {
  return conTope(
    db().begin(async (tx) => {
      if (teamId) {
        const [t] = await tx`select id from cc.teams where id = ${teamId} and season_id = ${seasonId}`;
        if (!t) throw new ErrorDeUsuario("Equipo no encontrado.", 404);
      }
      const [p] = await tx`update cc.players set team_id = ${teamId} where id = ${playerId} and season_id = ${seasonId} and status = 'active' returning id`;
      if (!p) throw new ErrorDeUsuario("Solo se asignan jugadores aprobados.");
      await auditar(tx, seasonId, adminId, "asignar_equipo", { playerId, teamId });
    }),
  );
}

/** Reparte a TODOS los jugadores activos al azar en equipos equilibrados. */
export async function repartirAlAzar(adminId: string, seasonId: string) {
  return conTope(
    db().begin(async (tx) => {
      const equipos = await tx`select id from cc.teams where season_id = ${seasonId} order by created_at`;
      const jugadores = await tx`select id from cc.players where season_id = ${seasonId} and status = 'active' order by created_at`;
      if (equipos.length === 0 || jugadores.length === 0) throw new ErrorDeUsuario("No hay equipos o jugadores aprobados.");
      const grupos = repartirEquipos(
        jugadores.map((j) => j.id as string),
        equipos.length,
      );
      for (let i = 0; i < grupos.length; i++) {
        if (grupos[i].length) await tx`update cc.players set team_id = ${equipos[i].id} where id = any(${grupos[i]}::uuid[])`;
      }
      await auditar(tx, seasonId, adminId, "repartir_equipos", { jugadores: jugadores.length });
      await tx`insert into cc.chaos_events (season_id, event_type, payload) values (${seasonId}, 'equipos_sorteados', ${tx.json({ jugadores: jugadores.length })})`;
    }),
  );
}

export async function renombrarEquipo(adminId: string, seasonId: string, teamId: string, nombre: string) {
  const n = nombre.trim().replace(/\s+/g, " ");
  if (n.length < 2 || n.length > 40) throw new ErrorDeUsuario("El nombre del equipo debe tener entre 2 y 40 letras.");
  return conTope(
    db().begin(async (tx) => {
      const [t] = await tx`update cc.teams set name = ${n} where id = ${teamId} and season_id = ${seasonId} returning id`;
      if (!t) throw new ErrorDeUsuario("Equipo no encontrado.", 404);
      await auditar(tx, seasonId, adminId, "renombrar_equipo", { teamId, nombre: n });
    }),
  );
}

export async function cambiarFechas(adminId: string, seasonId: string, desde: string, hasta: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) throw new ErrorDeUsuario("Fechas inválidas.");
  const ini = inicioDelDia(desde);
  const fin = new Date(inicioDelDia(hasta).getTime() + 86_400_000 - 1000);
  const dias = Math.round((fin.getTime() + 1000 - ini.getTime()) / 86_400_000);
  if (dias < 7 || dias > 60) throw new ErrorDeUsuario("La temporada debe durar entre 7 y 60 días.");
  return conTope(
    db().begin(async (tx) => {
      await tx`update cc.seasons set starts_at = ${ini}, ends_at = ${fin} where id = ${seasonId}`;
      await auditar(tx, seasonId, adminId, "cambiar_fechas", { desde, hasta });
    }),
  );
}

/** Temporada de prueba: simular un día (1..N) para probar el calendario en una tarde. */
export async function simularDia(adminId: string, seasonId: string, dia: number | null) {
  return conTope(
    db().begin(async (tx) => {
      const [s] = await tx`select settings, starts_at, ends_at from cc.seasons where id = ${seasonId} for update`;
      if (!s?.settings?.prueba) throw new ErrorDeUsuario("Solo las temporadas de prueba pueden simular días.");
      const total = Math.round((new Date(s.ends_at).getTime() + 1000 - new Date(s.starts_at).getTime()) / 86_400_000);
      if (dia !== null && (!Number.isInteger(dia) || dia < 1 || dia > total)) throw new ErrorDeUsuario(`El día debe estar entre 1 y ${total}.`);
      await tx`update cc.seasons set settings = settings || ${tx.json({ diaSimulado: dia })} where id = ${seasonId}`;
      await auditar(tx, seasonId, adminId, "simular_dia", { dia });
    }),
  );
}

/** Ajuste manual de monedas: movimiento compensatorio auditado (el ledger no se edita). */
export async function ajustarPuntos(adminId: string, seasonId: string, playerId: string, puntos: number, motivo: string) {
  if (!Number.isInteger(puntos) || puntos === 0 || Math.abs(puntos) > 500) throw new ErrorDeUsuario("El ajuste debe ser un número entero entre −500 y 500, distinto de 0.");
  const m = motivo.trim();
  if (m.length < 4 || m.length > 140) throw new ErrorDeUsuario("Escribe el motivo del ajuste (4 a 140 letras).");
  return conTope(
    db().begin(async (tx) => {
      const [p] = await tx`select id, team_id from cc.players where id = ${playerId} and season_id = ${seasonId}`;
      if (!p) throw new ErrorDeUsuario("Jugador no encontrado.", 404);
      const [a] = await tx`insert into cc.admin_audit_log (season_id, actor_id, action, payload) values (${seasonId}, ${adminId}, 'ajustar_puntos', ${tx.json({ playerId, puntos, motivo: m })}) returning id`;
      await tx`
        insert into cc.score_ledger (season_id, player_id, team_id, source_type, source_id, coins, reason, idempotency_key, created_by)
        values (${seasonId}, ${playerId}, ${p.team_id}, 'ajuste', ${a.id}, ${puntos}, ${m}, ${`ajuste:${a.id}`}, ${adminId})
      `;
    }),
  );
}
