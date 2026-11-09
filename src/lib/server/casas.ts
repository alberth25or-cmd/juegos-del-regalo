import "server-only";
import { crearAzar } from "@/features/azar";
import { aliasLibre, igualQue, mayoria, preguntasDelDia, semilla, sortear, validarFicha, validarRespuesta } from "@/features/casas/reglas";
import { datosPregunta } from "@/features/contenido/casas";
import { filtrarChat } from "@/features/contenido/filtro";
import { costoPasar, costoVencida, FISGONEAR, GANANCIAS, PASES_POR_CASA } from "@/features/scoring/economia";
import { estadoConPrueba, diaLocal, inicioDelDia } from "@/features/season/calendario";
import { masPicantes, type RespuestaFicha } from "@/features/stages/ficha";
import { avatarDeAlias } from "@/features/avatar";
import { ErrorDeUsuario } from "./api";
import { conTope, db, type Tx } from "./db";
import { estadoDe, type Jugador } from "./sesion";

/**
 * Juego de las casas, conectado a la base de datos.
 *
 * - Antes del "Empezar": cada jugador llena su ficha (pase al árbol).
 * - "Empezar" (organizador): alias para todos, sorteo secreto, se cierra la puerta y se abren
 *   las casas. Si la temporada todavía no empezaba, empieza hoy.
 * - Cada día salen preguntas nuevas por casa (`preguntasDelDia`). Las que vencen se cobran de
 *   forma perezosa la próxima vez que el jugador entra (`liquidar`), con claves de idempotencia:
 *   repetir nunca cobra dos veces.
 * - Todo movimiento de monedas va al ledger (append-only) dentro de una transacción.
 */

const CASAS_CON_PREGUNTAS = [2, 3, 4] as const;
const JUEGOS_CALENTAMIENTO = ["gift-catcher", "memory", "trivia"] as const;

interface ConfigCasas {
  empezadoEn: string;
  diaInicio: number;
  fichaDia: number;
}

async function temporada(seasonId: string, sql: Tx | ReturnType<typeof db> = db()) {
  const [s] = await conTope(sql`select id, settings, starts_at, ends_at from cc.seasons where id = ${seasonId}`);
  const casas = (s?.settings?.casas ?? null) as ConfigCasas | null;
  return { settings: s?.settings ?? {}, casas, startsAt: new Date(s.starts_at), endsAt: new Date(s.ends_at) };
}

function diaDe(yo: Jugador) {
  const e = estadoDe(yo);
  return { dia: e.fase === "en-curso" ? e.dia : e.fase === "terminada" ? e.dia : 0, totalDias: e.fase === "pretemporada" ? 0 : e.totalDias };
}

const clave = (tipo: string, ...partes: string[]) => `${tipo}:${partes.join(":")}`;

async function monedasDe(sql: Tx | ReturnType<typeof db>, playerId: string) {
  const [r] = await sql`select coalesce(sum(points + coins), 0)::int as m from cc.score_ledger where player_id = ${playerId}`;
  return r.m as number;
}

async function movimiento(tx: Tx, yo: Jugador, tipo: string, fuente: string, monedas: number, motivo: string, idem: string) {
  await tx`
    insert into cc.score_ledger (season_id, player_id, team_id, source_type, source_id, coins, reason, idempotency_key)
    values (${yo.seasonId}, ${yo.id}, ${yo.teamId}, ${tipo}, ${fuente}, ${monedas}, ${motivo}, ${idem})
    on conflict (idempotency_key) do nothing
  `;
}

/** Preguntas del día con su casa, según si el jugador juega Picante. */
function idsDelDia(seasonId: string, dia: number, juegaPicante: boolean | null) {
  const q = preguntasDelDia(seasonId, dia);
  const lista: { id: string; casa: 2 | 3 | 4 }[] = [{ id: q.manada.id, casa: 2 }, ...q.amor.map((p) => ({ id: p.id, casa: 3 as const }))];
  if (juegaPicante === true) lista.push(...q.picante.map((p) => ({ id: p.id, casa: 4 as const })));
  return lista;
}

async function pasesUsados(tx: Tx, playerId: string, casa: number) {
  const [r] = await tx`select count(*)::int as n from cc.respuestas where player_id = ${playerId} and casa = ${casa} and estado in ('paso', 'vencida')`;
  return Math.min(PASES_POR_CASA, r.n as number);
}

/**
 * Cobra lo pendiente de días anteriores: preguntas vencidas y el extra de La manada
 * (coincidir con la mayoría). Idempotente.
 */
async function liquidar(tx: Tx, yo: Jugador, cfg: ConfigCasas, hoy: number, juegaPicante: boolean | null) {
  if (hoy <= cfg.diaInicio) return;
  const desde = cfg.diaInicio;
  const hasta = Math.min(hoy - 1, desde + 89);
  const tengo = new Set(
    (await tx`select pregunta_id from cc.respuestas where player_id = ${yo.id} and dia between ${desde} and ${hasta}`).map((r) => r.pregunta_id as string),
  );
  for (let d = desde; d <= hasta; d++) {
    for (const q of idsDelDia(yo.seasonId, d, juegaPicante)) {
      if (tengo.has(q.id)) continue;
      const usados = q.casa === 2 ? 0 : await pasesUsados(tx, yo.id, q.casa);
      const c = costoVencida(q.casa, usados);
      const [r] = await tx`
        insert into cc.respuestas (season_id, player_id, casa, pregunta_id, dia, estado)
        values (${yo.seasonId}, ${yo.id}, ${q.casa}, ${q.id}, ${d}, 'vencida')
        on conflict (player_id, pregunta_id) do nothing returning id
      `;
      if (r && c.monedas > 0) await movimiento(tx, yo, "casa-vencida", q.id, -c.monedas, "Pregunta sin responder a tiempo", clave("vencida", yo.seasonId, q.id, yo.id));
    }
  }
  // La manada: el extra por coincidir se decide al cierre del día.
  const pendientes = await tx`
    select r.pregunta_id, r.respuesta from cc.respuestas r
    where r.player_id = ${yo.id} and r.casa = 2 and r.estado = 'respondida' and r.dia < ${hoy}
      and not exists (select 1 from cc.score_ledger l where l.idempotency_key = 'manada:' || ${yo.seasonId} || ':' || r.pregunta_id || ':' || ${yo.id})
  `;
  for (const p of pendientes) {
    const todas = (await tx`select respuesta from cc.respuestas where season_id = ${yo.seasonId} and pregunta_id = ${p.pregunta_id} and estado = 'respondida'`).map((x) => x.respuesta as string);
    const gano = mayoria(todas).has(p.respuesta as string);
    await movimiento(tx, yo, "manada-coincide", p.pregunta_id, gano ? GANANCIAS.manadaCoincidir : 0, gano ? "La manada: coincidiste con la mayoría" : "La manada: esta vez no coincidiste", clave("manada", yo.seasonId, p.pregunta_id, yo.id));
  }
}

async function asegurarAlias(tx: Tx, yo: Jugador): Promise<string> {
  const [p] = await tx`select alias from cc.players where id = ${yo.id}`;
  if (p?.alias) return p.alias as string;
  const usados = new Set((await tx`select alias from cc.players where season_id = ${yo.seasonId} and alias is not null`).map((r) => r.alias as string));
  const alias = aliasLibre(usados, crearAzar(semilla(`${yo.id}:${Date.now()}`)));
  await tx`update cc.players set alias = ${alias} where id = ${yo.id} and alias is null`;
  const [q] = await tx`select alias from cc.players where id = ${yo.id}`;
  return q.alias as string;
}

/** Calentamiento: minijuegos validados hoy (fecha real de Lima). */
async function juegosDeHoy(sql: Tx | ReturnType<typeof db>, playerId: string) {
  const rows = await sql`
    select distinct game_slug from cc.game_attempts
    where player_id = ${playerId} and status = 'validated' and local_day = (now() at time zone 'America/Lima')::date
  `;
  return new Set(rows.map((r) => r.game_slug as string));
}

/** Bono por terminar todo lo del día en todas las casas (una vez por día). */
async function bonoSiCorresponde(tx: Tx, yo: Jugador, hoy: number, juegaPicante: boolean | null) {
  const ids = idsDelDia(yo.seasonId, hoy, juegaPicante).map((q) => q.id);
  const [r] = await tx`select count(*)::int as n from cc.respuestas where player_id = ${yo.id} and pregunta_id = any(${ids}) and estado <> 'vencida'`;
  const juegos = await juegosDeHoy(tx, yo.id);
  if ((r.n as number) >= ids.length && JUEGOS_CALENTAMIENTO.every((j) => juegos.has(j))) {
    await movimiento(tx, yo, "bono-dia", String(hoy), GANANCIAS.bonoAlDia, "Al día en todas las casas", clave("bono", yo.seasonId, String(hoy), yo.id));
  }
}

// ======================================================================= estado

export interface EstadoCasas {
  empezado: boolean;
  dia: number;
  totalDias: number;
  fichaDia: number | null;
  fichaAbierta: boolean;
  yo: { alias: string; avatar: unknown; monedas: number; puesto: number; juegaPicante: boolean | null; tieneFicha: boolean; tieneAmigo: boolean; admin: boolean };
  ranking: { alias: string; avatar: unknown; monedas: number; yo: boolean }[];
  /** Por casa: alias de quienes ya están al día hoy (para el riel). */
  alDia: Record<number, string[]>;
  calentamiento: { hechos: string[] };
  manada: { id: string; texto: string; opciones: string[]; mia: string | null; estado: string | null } | null;
  amor: { id: string; texto: string; mia: string | null; estado: string | null }[];
  picante: { id: string; texto: string; mia: string | null; estado: string | null }[];
  pases: { 3: number; 4: number };
  fisgoneosHoy: number;
  arbol: { inscritos: { alias: string; avatar: unknown; yo: boolean }[]; capacidad: number };
}

export async function estadoCasas(yo: Jugador): Promise<EstadoCasas> {
  const sql = db();
  const t = await temporada(yo.seasonId);
  const { dia, totalDias } = diaDe(yo);
  const cfg = t.casas;
  const empezado = !!cfg && dia > 0;

  const { alias, juegaPicante } = await conTope(
    sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(hashtext(${"casas:" + yo.id}))`;
      const alias = yo.status === "active" ? await asegurarAlias(tx, yo) : "";
      const [p] = await tx`select juega_picante from cc.players where id = ${yo.id}`;
      const jp = (p?.juega_picante ?? null) as boolean | null;
      if (empezado && yo.status === "active") {
        await liquidar(tx, yo, cfg!, dia, jp);
        await bonoSiCorresponde(tx, yo, dia, jp);
      }
      return { alias, juegaPicante: jp };
    }),
    12_000,
    "preparación de las casas",
  );

  const q = empezado ? preguntasDelDia(yo.seasonId, dia) : null;
  const idsHoy = q ? [q.manada.id, ...q.amor.map((p) => p.id), ...q.picante.map((p) => p.id)] : [];

  const [ranking, misHoy, alDiaRows, ficha, amigo, fisg, juegos, inscritos, pas] = await Promise.all([
    conTope(() => sql`
      select p.id, p.alias, p.avatar, coalesce(v.monedas, 0)::int as monedas
      from cc.players p left join cc.v_totals v on v.player_id = p.id
      where p.season_id = ${yo.seasonId} and p.status = 'active' and p.alias is not null
      order by monedas desc, p.alias asc
    `),
    idsHoy.length ? conTope(() => sql`select pregunta_id, estado, respuesta from cc.respuestas where player_id = ${yo.id} and pregunta_id = any(${idsHoy})`) : Promise.resolve([]),
    idsHoy.length
      ? conTope(() => sql`
          select p.alias, r.casa, count(*)::int as n from cc.respuestas r join cc.players p on p.id = r.player_id
          where r.season_id = ${yo.seasonId} and r.pregunta_id = any(${idsHoy}) and r.estado <> 'vencida' and p.alias is not null
          group by p.alias, r.casa
        `)
      : Promise.resolve([]),
    conTope(() => sql`select 1 from cc.fichas where player_id = ${yo.id}`),
    conTope(() => sql`select 1 from cc.amigo_secreto where giver_id = ${yo.id}`),
    empezado
      ? conTope(() => sql`select count(*)::int as n from cc.fisgoneos f join cc.respuestas r on r.id = f.respuesta_id where r.player_id = ${yo.id} and f.dia = ${dia}`)
      : Promise.resolve([{ n: 0 }]),
    juegosDeHoy(sql, yo.id),
    conTope(() => sql`
      select p.id, coalesce(p.alias, '') as alias, p.avatar from cc.players p join cc.fichas f on f.player_id = p.id
      where p.season_id = ${yo.seasonId} and p.status = 'active' order by p.alias asc
    `),
    conTope(() => sql`select casa, least(count(*), ${PASES_POR_CASA})::int as n from cc.respuestas where player_id = ${yo.id} and estado in ('paso', 'vencida') group by casa`),
  ]);

  const mias = new Map(misHoy.map((r) => [r.pregunta_id as string, r]));
  const yoFila = ranking.findIndex((r) => r.id === yo.id);
  const alDia: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  for (const r of alDiaRows) {
    const casa = r.casa as number;
    if (r.n >= (casa === 2 ? 1 : 2)) alDia[casa].push(r.alias as string);
  }
  const pases = { 3: 0, 4: 0 } as { 3: number; 4: number };
  for (const r of pas) if (r.casa === 3 || r.casa === 4) pases[r.casa as 3 | 4] = r.n as number;
  const dePregunta = (id: string, texto: string) => {
    const m = mias.get(id);
    return { id, texto, mia: (m?.respuesta as string | null) ?? null, estado: (m?.estado as string | null) ?? null };
  };

  return {
    empezado,
    dia,
    totalDias,
    fichaDia: cfg?.fichaDia ?? null,
    fichaAbierta: !!cfg && dia >= cfg.fichaDia,
    yo: {
      alias,
      avatar: avatarDeAlias(alias),
      monedas: yoFila >= 0 ? (ranking[yoFila].monedas as number) : 0,
      puesto: yoFila + 1,
      juegaPicante,
      tieneFicha: ficha.length > 0,
      tieneAmigo: amigo.length > 0,
      admin: yo.role === "admin",
    },
    ranking: ranking.map((r) => ({ alias: r.alias as string, avatar: avatarDeAlias(r.alias as string), monedas: r.monedas as number, yo: r.id === yo.id })),
    alDia,
    calentamiento: { hechos: JUEGOS_CALENTAMIENTO.filter((j) => juegos.has(j)) },
    manada: q ? { ...dePregunta(q.manada.id, q.manada.texto), opciones: q.manada.opciones } : null,
    amor: q ? q.amor.map((p) => dePregunta(p.id, p.texto)) : [],
    picante: q && juegaPicante === true ? q.picante.map((p) => dePregunta(p.id, p.texto)) : [],
    pases,
    fisgoneosHoy: (fisg[0]?.n as number) ?? 0,
    arbol: {
      inscritos: inscritos.map((r) => ({ alias: (r.alias as string) || "Agente sin nombre", avatar: avatarDeAlias((r.alias as string) || (r.id as string)), yo: r.id === yo.id })),
      capacidad: typeof t.settings.capacidad === "number" ? t.settings.capacidad : 40,
    },
  };
}

// ======================================================================= acciones

function exigirEmpezado(cfg: ConfigCasas | null, dia: number) {
  if (!cfg || dia <= 0) throw new ErrorDeUsuario("Las casas se abren cuando el organizador aprieta \"Empezar\".", 409);
}

/** Responder (o pasar) una pregunta de HOY. */
export async function responder(yo: Jugador, preguntaId: string, valor: unknown, pasar: boolean) {
  const t = await temporada(yo.seasonId);
  const { dia } = diaDe(yo);
  exigirEmpezado(t.casas, dia);
  const dp = datosPregunta(preguntaId);
  if (!dp) throw new ErrorDeUsuario("Pregunta no encontrada.", 404);
  const hoy = preguntasDelDia(yo.seasonId, dia);
  const deHoy = [hoy.manada.id, ...hoy.amor.map((p) => p.id), ...hoy.picante.map((p) => p.id)];
  if (!deHoy.includes(preguntaId)) throw new ErrorDeUsuario("Esa pregunta ya no está abierta. Mira las de hoy.", 409);

  await conTope(
    db().begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(hashtext(${"casas:" + yo.id}))`;
      const [p] = await tx`select juega_picante from cc.players where id = ${yo.id}`;
      const jp = (p?.juega_picante ?? null) as boolean | null;
      if (dp.casa === 4 && jp !== true) throw new ErrorDeUsuario("Primero confirma si juegas Picante.", 409);
      await liquidar(tx, yo, t.casas!, dia, jp);

      let estado: "respondida" | "paso" = "respondida";
      let texto: string | null = null;
      let monedas = 0;
      if (pasar) {
        const usados = await pasesUsados(tx, yo.id, dp.casa);
        const c = costoPasar(dp.casa, usados);
        if (!c.permitido) throw new ErrorDeUsuario(c.motivo, 409);
        if ((await monedasDe(tx, yo.id)) < c.monedas) throw new ErrorDeUsuario("No te alcanzan las monedas para pasar.", 409);
        estado = "paso";
        monedas = -c.monedas;
      } else {
        const v = validarRespuesta(dp.casa, valor, dp.opciones);
        if (!v.ok) throw new ErrorDeUsuario(v.error);
        if (dp.casa === 3) {
          const f = filtrarChat(v.texto);
          if (!f.ok) throw new ErrorDeUsuario(f.motivo);
          texto = f.texto;
        } else texto = v.texto;
        monedas = dp.casa === 2 ? GANANCIAS.manadaResponder : dp.casa === 3 ? GANANCIAS.amor : GANANCIAS.picante;
      }
      const [r] = await tx`
        insert into cc.respuestas (season_id, player_id, casa, pregunta_id, dia, estado, respuesta)
        values (${yo.seasonId}, ${yo.id}, ${dp.casa}, ${preguntaId}, ${dia}, ${estado}, ${texto})
        on conflict (player_id, pregunta_id) do nothing returning id
      `;
      if (!r) throw new ErrorDeUsuario("Ya respondiste esta pregunta.", 409);
      await movimiento(tx, yo, pasar ? "casa-paso" : "casa-respuesta", preguntaId, monedas, pasar ? "Pasó una pregunta" : "Respondió una pregunta", clave(pasar ? "paso" : "casa", yo.seasonId, preguntaId, yo.id));
      await bonoSiCorresponde(tx, yo, dia, jp);
    }),
    10_000,
    "respuesta",
  );
  return estadoCasas(yo);
}

/** Picante: juega (mayor de edad) o no. Se decide una vez. */
export async function decidirPicante(yo: Jugador, acepta: boolean) {
  await conTope(db()`update cc.players set juega_picante = ${acepta} where id = ${yo.id} and juega_picante is null`);
  return estadoCasas(yo);
}

/** Guarda (o actualiza) la ficha de inscripción. */
export async function guardarFicha(yo: Jugador, regalos: unknown, datos: unknown) {
  const v = validarFicha(regalos, datos);
  if (!v.ok) throw new ErrorDeUsuario(v.error);
  for (const r of [...v.ficha.regalos, v.ficha.datos.rasgo ?? ""].filter(Boolean)) {
    const f = filtrarChat(r);
    if (!f.ok) throw new ErrorDeUsuario(f.motivo);
  }
  await conTope(db()`
    insert into cc.fichas (player_id, season_id, regalos, datos)
    values (${yo.id}, ${yo.seasonId}, ${db().json(v.ficha.regalos)}, ${db().json(v.ficha.datos)})
    on conflict (player_id) do update set regalos = excluded.regalos, datos = excluded.datos, updated_at = now()
  `);
  return estadoCasas(yo);
}

export async function miFicha(yo: Jugador) {
  const [f] = await conTope(() => db()`select regalos, datos from cc.fichas where player_id = ${yo.id}`);
  return f ? { regalos: f.regalos as string[], datos: f.datos as Record<string, string> } : null;
}

// ======================================================================= ficha del amigo

export interface FichaAmigo {
  alias: string;
  avatar: unknown;
  regalos: string[];
  datos: { label: string; valor: string }[];
  juegaPicante: boolean | null;
  respuestas: (RespuestaFicha & { estado: string; abierta: boolean })[];
  destacadas: string[];
  final: boolean;
  gratisHoy: number;
  monedas: number;
  dia: number;
  fichaDia: number;
}

const ETIQUETA: Record<string, string> = { genero: "Género", lentes: "Lentes", estatura: "Estatura", cabello: "Cabello", rasgo: "La delata" };

export async function fichaAmigo(yo: Jugador): Promise<FichaAmigo | null> {
  const t = await temporada(yo.seasonId);
  const { dia } = diaDe(yo);
  const sql = db();
  const [par] = await conTope(() => sql`select receiver_id from cc.amigo_secreto where giver_id = ${yo.id}`);
  if (!par || !t.casas) return null;
  const amigoId = par.receiver_id as string;
  const final = dia >= t.casas.fichaDia;
  const [[a], [f], resp, abiertos, [gr], monedas] = await Promise.all([
    conTope(() => sql`select alias, avatar, juega_picante from cc.players where id = ${amigoId}`),
    conTope(() => sql`select regalos, datos from cc.fichas where player_id = ${amigoId}`),
    conTope(() => sql`select id, casa, pregunta_id, estado, respuesta, dia from cc.respuestas where player_id = ${amigoId} and casa in (2, 3, 4) order by dia, created_at`),
    conTope(() => sql`select respuesta_id from cc.fisgoneos where buyer_id = ${yo.id}`),
    conTope(() => sql`select count(*)::int as n from cc.fisgoneos where buyer_id = ${yo.id} and gratis and dia = ${dia}`),
    monedasDe(sql, yo.id),
  ]);
  const yaAbiertos = new Set(abiertos.map((r) => r.respuesta_id as string));

  // Rareza (solo hace falta al final, para "lo más picante").
  const respondidas = resp.filter((r) => r.estado === "respondida");
  const otras = final && respondidas.length
    ? await conTope(() => sql`select pregunta_id, respuesta from cc.respuestas where season_id = ${yo.seasonId} and estado = 'respondida' and pregunta_id = any(${respondidas.map((r) => r.pregunta_id as string)})`)
    : [];
  const porPregunta = new Map<string, string[]>();
  for (const o of otras) porPregunta.set(o.pregunta_id as string, [...(porPregunta.get(o.pregunta_id as string) ?? []), o.respuesta as string]);

  const base: (RespuestaFicha & { estado: string; dbAbierta: boolean })[] = [];
  for (const r of resp) {
    const dp = datosPregunta(r.pregunta_id as string);
    if (!dp) continue;
    const texto = r.respuesta === null ? null : dp.opciones ? dp.opciones[Number(r.respuesta)] ?? null : (r.respuesta as string);
    base.push({
      id: r.id as string,
      casa: dp.casa,
      pregunta: dp.texto,
      respuesta: r.estado === "respondida" ? texto : null,
      picor: dp.picor,
      igualQue: final && r.respuesta !== null ? igualQue(r.respuesta as string, porPregunta.get(r.pregunta_id as string) ?? []) : undefined,
      estado: r.estado as string,
      dbAbierta: yaAbiertos.has(r.id as string),
    });
  }
  const destacadas = final ? masPicantes(base).map((r) => r.id) : [];
  const datos = f ? Object.entries(f.datos as Record<string, string>).map(([k, v]) => ({ label: ETIQUETA[k] ?? k, valor: v })) : [];

  return {
    alias: (a?.alias as string) ?? "Agente",
    avatar: avatarDeAlias((a?.alias as string) ?? amigoId),
    regalos: (f?.regalos as string[]) ?? [],
    datos,
    juegaPicante: (a?.juega_picante ?? null) as boolean | null,
    // Lo cerrado NUNCA sale del servidor: sin texto de respuesta ni rareza.
    respuestas: base.map(({ dbAbierta, ...r }) => {
      const abierta = r.estado !== "respondida" || dbAbierta || destacadas.includes(r.id);
      return abierta ? { ...r, abierta } : { ...r, respuesta: "", igualQue: undefined, abierta };
    }),
    destacadas,
    final,
    gratisHoy: Math.max(0, 1 - ((gr?.n as number) ?? 0)),
    monedas,
    dia,
    fichaDia: t.casas.fichaDia,
  };
}

/** Abre un sobre de la ficha del amigo secreto: gratis (1 por día) o pagando monedas. */
export async function fisgonear(yo: Jugador, respuestaId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(respuestaId)) throw new ErrorDeUsuario("Sobre no encontrado.", 404);
  const { dia } = diaDe(yo);
  await conTope(
    db().begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(hashtext(${"casas:" + yo.id}))`;
      const [r] = await tx`
        select r.id, r.casa, r.estado from cc.respuestas r
        join cc.amigo_secreto s on s.receiver_id = r.player_id and s.giver_id = ${yo.id}
        where r.id = ${respuestaId}
      `;
      if (!r) throw new ErrorDeUsuario("Ese sobre no es de tu amigo secreto.", 404);
      if (r.estado !== "respondida") throw new ErrorDeUsuario("Ese sobre no tiene nada adentro.", 409);
      const [ya] = await tx`select 1 from cc.fisgoneos where buyer_id = ${yo.id} and respuesta_id = ${respuestaId}`;
      if (ya) throw new ErrorDeUsuario("Ya abriste ese sobre.", 409);
      const [g] = await tx`select count(*)::int as n from cc.fisgoneos where buyer_id = ${yo.id} and gratis and dia = ${dia}`;
      const gratis = (g.n as number) < 1;
      const costo = gratis ? 0 : FISGONEAR[r.casa as 2 | 3 | 4];
      if (!gratis && (await monedasDe(tx, yo.id)) < costo) throw new ErrorDeUsuario("No te alcanzan las monedas para abrir este sobre.", 409);
      await tx`insert into cc.fisgoneos (season_id, buyer_id, respuesta_id, monedas, gratis, dia) values (${yo.seasonId}, ${yo.id}, ${respuestaId}, ${costo}, ${gratis}, ${dia})`;
      if (costo > 0) await movimiento(tx, yo, "fisgoneo", respuestaId, -costo, "Fisgoneó a su amigo secreto", clave("fisgoneo", yo.id, respuestaId));
    }),
    10_000,
    "fisgoneo",
  );
  return fichaAmigo(yo);
}

// ======================================================================= organizador

export async function estadoOrganizador(seasonId: string) {
  const t = await temporada(seasonId);
  const [r] = await conTope(() => db()`
    select count(*) filter (where p.status = 'active')::int as activos,
           count(f.player_id) filter (where p.status = 'active')::int as con_ficha
    from cc.players p left join cc.fichas f on f.player_id = p.id
    where p.season_id = ${seasonId}
  `);
  return { empezado: !!t.casas, empezadoEn: t.casas?.empezadoEn ?? null, fichaDia: t.casas?.fichaDia ?? null, activos: r.activos as number, conFicha: r.con_ficha as number };
}

/** "Empezar": alias para todos, sorteo secreto, se cierra la puerta y se abren las casas. */
export async function empezar(adminId: string, seasonId: string) {
  return conTope(
    db().begin(async (tx) => {
      const [s] = await tx`select settings, starts_at, ends_at from cc.seasons where id = ${seasonId} for update`;
      if (s.settings?.casas) throw new ErrorDeUsuario("El juego ya empezó.", 409);
      const jugadores = await tx`
        select p.id, p.alias, (f.player_id is not null) as ficha from cc.players p left join cc.fichas f on f.player_id = p.id
        where p.season_id = ${seasonId} and p.status = 'active'
      `;
      const conFicha = jugadores.filter((j) => j.ficha).map((j) => j.id as string);
      if (conFicha.length < 2) throw new ErrorDeUsuario("Se necesitan al menos 2 agentes con la ficha completa.");

      // Alias para quien todavía no tiene.
      const usados = new Set(jugadores.filter((j) => j.alias).map((j) => j.alias as string));
      const azar = crearAzar(semilla(`${seasonId}:${Date.now()}`));
      for (const j of jugadores.filter((x) => !x.alias)) {
        const a = aliasLibre(usados, azar);
        usados.add(a);
        await tx`update cc.players set alias = ${a} where id = ${j.id}`;
      }

      for (const p of sortear(conFicha, azar)) {
        await tx`insert into cc.amigo_secreto (season_id, giver_id, receiver_id) values (${seasonId}, ${p.giver}, ${p.receiver})`;
      }

      // Si la temporada todavía no empezaba, empieza hoy (así cuentan las monedas de todo).
      let inicio = new Date(s.starts_at);
      const fin = new Date(s.ends_at);
      const ahora = new Date();
      if (inicio > ahora) {
        inicio = inicioDelDia(diaLocal(ahora));
        await tx`update cc.seasons set starts_at = ${inicio} where id = ${seasonId}`;
      }
      const prueba = s.settings?.prueba === true;
      const e = estadoConPrueba(ahora, inicio, fin, prueba, typeof s.settings?.diaSimulado === "number" ? s.settings.diaSimulado : null);
      const diaInicio = e.fase === "en-curso" ? e.dia : 1;
      const total = e.fase === "pretemporada" ? 30 : e.totalDias;
      const fichaDia = Math.max(diaInicio + 1, total - 4);
      const casas: ConfigCasas = { empezadoEn: ahora.toISOString(), diaInicio, fichaDia };
      await tx`update cc.seasons set settings = settings || ${tx.json({ casas } as never)} where id = ${seasonId}`;
      await tx`insert into cc.admin_audit_log (season_id, actor_id, action, payload) values (${seasonId}, ${adminId}, 'empezar_casas', ${tx.json({ agentes: conFicha.length, diaInicio, fichaDia })})`;
      await tx`insert into cc.chaos_events (season_id, event_type, payload) values (${seasonId}, 'casas_abiertas', ${tx.json({ agentes: conFicha.length })})`;
      return { agentes: conFicha.length, diaInicio, fichaDia };
    }),
    15_000,
    "inicio del juego",
  );
}

/** Día de la temporada en que se abre la ficha final para todos. */
export async function cambiarDiaFicha(adminId: string, seasonId: string, fichaDia: number) {
  return conTope(
    db().begin(async (tx) => {
      const [s] = await tx`select settings from cc.seasons where id = ${seasonId} for update`;
      const casas = s.settings?.casas as ConfigCasas | undefined;
      if (!casas) throw new ErrorDeUsuario("Primero aprieta \"Empezar\".", 409);
      if (!Number.isInteger(fichaDia) || fichaDia <= casas.diaInicio || fichaDia > 90) throw new ErrorDeUsuario("Ese día no sirve para la ficha.");
      await tx`update cc.seasons set settings = jsonb_set(settings, '{casas,fichaDia}', ${tx.json(fichaDia)}) where id = ${seasonId}`;
      await tx`insert into cc.admin_audit_log (season_id, actor_id, action, payload) values (${seasonId}, ${adminId}, 'dia_ficha', ${tx.json({ fichaDia })})`;
    }),
  );
}

export const CASAS = CASAS_CON_PREGUNTAS;
