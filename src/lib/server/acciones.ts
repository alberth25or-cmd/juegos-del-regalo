"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import {
  PIN_LOCK_MINUTES,
  PIN_MAX_FAILS,
  hashLookup,
  hashPin,
  newInviteCode,
  newRescueCode,
  normalizeRescueCode,
  validatePin,
  verifyPin,
} from "./seguridad";
import { agenteActual, cerrarSesion, iniciarSesion } from "./sesion";
import { AVATARES } from "@/lib/avatares";

export type Resultado =
  | null
  | { ok: false; error: string }
  | { ok: true; rescueCode?: string; inviteCode?: string; groupName?: string; pending?: boolean };

const MAX_AGENTES = 60;

function texto(fd: FormData, campo: string) {
  return String(fd.get(campo) ?? "").trim().replace(/\s+/g, " ");
}

function validarAgente(fd: FormData): { error: string } | { alias: string; codename: string; avatar: string; pin: string } {
  const alias = texto(fd, "apodo");
  const codename = texto(fd, "nombreClave");
  const avatar = texto(fd, "avatar");
  const pin = texto(fd, "pin");
  const pin2 = texto(fd, "pin2");
  if (alias.length < 1 || alias.length > 40) return { error: "Escribe tu apodo (máximo 40 letras)." };
  if (codename.length < 2 || codename.length > 40) return { error: "Tu nombre de agente debe tener entre 2 y 40 letras." };
  if (!AVATARES.includes(avatar)) return { error: "Elige un avatar." };
  const pinError = validatePin(pin);
  if (pinError) return { error: pinError };
  if (pin !== pin2) return { error: "Los dos PIN no coinciden." };
  return { alias, codename, avatar, pin };
}

function esDuplicado(err: unknown) {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505";
}

// ------------------------------------------------------- crear un grupo
export async function crearGrupo(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const nombreGrupo = texto(fd, "grupo");
  if (nombreGrupo.length < 2 || nombreGrupo.length > 60) return { ok: false, error: "El nombre del grupo debe tener entre 2 y 60 letras." };
  if (fd.get("acepto") !== "si") return { ok: false, error: "Confirma que el dinero lo manejan ustedes." };
  const a = validarAgente(fd);
  if ("error" in a) return { ok: false, error: a.error };

  const rescueCode = newRescueCode();
  const pinHash = await hashPin(a.pin);
  const sql = db();

  let memberId = "";
  let inviteCode = "";
  try {
    await sql.begin(async (tx) => {
      inviteCode = newInviteCode();
      const [g] = await tx`
        insert into jdr.groups (name, invite_code) values (${nombreGrupo}, ${inviteCode}) returning id
      `;
      const [m] = await tx`
        insert into jdr.members (group_id, alias, codename, avatar, role, status, pin_hash, rescue_code_hash, approved_at)
        values (${g.id}, ${a.alias}, ${a.codename}, ${a.avatar}, 'organizer', 'approved', ${pinHash},
                ${hashLookup(normalizeRescueCode(rescueCode))}, now())
        returning id
      `;
      memberId = m.id;
      await tx`insert into jdr.powerups (member_id, kind) values (${m.id}, 'escudo')`;
      await tx`insert into jdr.activity_feed (group_id, kind, payload) values (${g.id}, 'grupo_creado', ${tx.json({ codename: a.codename })})`;
      await tx`insert into jdr.audit_log (group_id, actor_id, action) values (${g.id}, ${m.id}, 'crear_grupo')`;
    });
  } catch (err) {
    console.error("[crearGrupo]", err);
    return { ok: false, error: "No pudimos crear el grupo. Intenta otra vez en un momento." };
  }

  await iniciarSesion(memberId);
  return { ok: true, rescueCode, inviteCode, groupName: nombreGrupo };
}

// ------------------------------------------------- unirse con invitación
export async function unirse(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const codigo = texto(fd, "codigo").toUpperCase();
  const a = validarAgente(fd);
  if ("error" in a) return { ok: false, error: a.error };

  const sql = db();
  const [g] = await sql`
    select g.id, g.name, g.status, (select count(*)::int from jdr.members m where m.group_id = g.id) as total
    from jdr.groups g where g.invite_code = ${codigo}
  `;
  if (!g) return { ok: false, error: "Esta invitación no existe. Pídele el enlace al organizador." };
  if (g.status === "finished") return { ok: false, error: "Esta temporada ya terminó." };
  if (g.total >= MAX_AGENTES) return { ok: false, error: "Este grupo ya está lleno." };

  const rescueCode = newRescueCode();
  const pinHash = await hashPin(a.pin);
  let memberId = "";
  try {
    const [m] = await sql`
      insert into jdr.members (group_id, alias, codename, avatar, pin_hash, rescue_code_hash)
      values (${g.id}, ${a.alias}, ${a.codename}, ${a.avatar}, ${pinHash}, ${hashLookup(normalizeRescueCode(rescueCode))})
      returning id
    `;
    memberId = m.id;
    await sql`insert into jdr.activity_feed (group_id, kind, payload) values (${g.id}, 'agente_pendiente', ${sql.json({ codename: a.codename })})`;
  } catch (err) {
    if (esDuplicado(err)) return { ok: false, error: "Ese nombre de agente ya está tomado en este grupo. Inventa otro." };
    console.error("[unirse]", err);
    return { ok: false, error: "No pudimos registrarte. Intenta otra vez." };
  }

  await iniciarSesion(memberId);
  return { ok: true, rescueCode, groupName: g.name, pending: true };
}

// ----------------------------------------- entrar desde otro dispositivo
export async function entrar(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const rescate = normalizeRescueCode(texto(fd, "rescate"));
  const pin = texto(fd, "pin");
  const generico = { ok: false as const, error: "Código o PIN incorrecto." };
  if (rescate.length !== 8 || !/^\d{4}$/.test(pin)) return generico;

  const sql = db();
  const [m] = await sql`
    select id, pin_hash, pin_failed, pin_locked_until, status from jdr.members where rescue_code_hash = ${hashLookup(rescate)}
  `;
  if (!m) return generico;
  if (m.status === "rejected") return { ok: false, error: "Tu ingreso a este grupo fue rechazado." };
  if (m.pin_locked_until && new Date(m.pin_locked_until) > new Date()) {
    const min = Math.ceil((new Date(m.pin_locked_until).getTime() - Date.now()) / 60000);
    return { ok: false, error: `Demasiados intentos. Espera ${min} min y vuelve a probar.` };
  }

  if (!(await verifyPin(pin, m.pin_hash))) {
    const fallos = m.pin_failed + 1;
    if (fallos >= PIN_MAX_FAILS) {
      await sql`update jdr.members set pin_failed = 0, pin_locked_until = now() + make_interval(mins => ${PIN_LOCK_MINUTES}) where id = ${m.id}`;
      return { ok: false, error: `PIN bloqueado por ${PIN_LOCK_MINUTES} minutos por seguridad.` };
    }
    await sql`update jdr.members set pin_failed = ${fallos} where id = ${m.id}`;
    return { ok: false, error: `Código o PIN incorrecto. Te quedan ${PIN_MAX_FAILS - fallos} intento(s).` };
  }

  await sql`update jdr.members set pin_failed = 0, pin_locked_until = null, last_seen_at = now() where id = ${m.id}`;
  await iniciarSesion(m.id);
  redirect("/");
}

// ---------------------------------------------- organizador: aprobar/rechazar
export async function decidirAgente(fd: FormData) {
  const yo = await agenteActual();
  if (!yo || yo.role !== "organizer" || yo.status !== "approved") return;
  const memberId = texto(fd, "memberId");
  const decision = texto(fd, "decision");
  if (!["approved", "rejected"].includes(decision) || memberId === yo.id) return;

  const sql = db();
  await sql.begin(async (tx) => {
    const [m] = await tx`
      update jdr.members
      set status = ${decision}, approved_at = case when ${decision} = 'approved' then now() else null end
      where id = ${memberId} and group_id = ${yo.groupId} and status = 'pending'
      returning codename
    `;
    if (!m) return;
    if (decision === "approved") {
      await tx`insert into jdr.powerups (member_id, kind) values (${memberId}, 'escudo')`;
      await tx`insert into jdr.activity_feed (group_id, kind, payload) values (${yo.groupId}, 'agente_aprobado', ${tx.json({ codename: m.codename })})`;
    }
    await tx`insert into jdr.audit_log (group_id, actor_id, action, payload) values (${yo.groupId}, ${yo.id}, ${"decidir_agente"}, ${tx.json({ memberId, decision })})`;
  });
  revalidatePath("/panel");
}

// ------------------------------- organizador: nuevo código de rescate
// Para el agente que perdió su código. El organizador se lo manda por privado.
// El PIN sigue siendo necesario, así que el organizador no puede entrar como él.
export async function nuevoCodigoRescate(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const yo = await agenteActual();
  if (!yo || yo.role !== "organizer" || yo.status !== "approved") return { ok: false, error: "Solo el organizador." };
  const memberId = texto(fd, "memberId");
  const rescueCode = newRescueCode();
  const sql = db();
  const [m] = await sql`
    update jdr.members set rescue_code_hash = ${hashLookup(normalizeRescueCode(rescueCode))}
    where id = ${memberId} and group_id = ${yo.groupId}
    returning id
  `;
  if (!m) return { ok: false, error: "Agente no encontrado." };
  await sql`insert into jdr.audit_log (group_id, actor_id, action, payload) values (${yo.groupId}, ${yo.id}, 'nuevo_codigo_rescate', ${sql.json({ memberId })})`;
  return { ok: true, rescueCode };
}

// ------------------------------------------------------------- salir
export async function salir() {
  await cerrarSesion();
  redirect("/");
}
