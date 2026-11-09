import "server-only";
import { avatarValido, type ConfigAvatar } from "@/features/avatar";
import { comentario, contar, RECOMPENSA_VOTO, revelar, rondaEn, type Conteo } from "@/features/social/votacion";
import { ErrorDeUsuario } from "./api";
import { conTope, db } from "./db";
import { estadoDe, type Jugador } from "./sesion";

export interface Votante {
  id: string;
  nombre: string;
  avatar: ConfigAvatar;
}

export interface ResultadoRonda {
  pregunta: string;
  conteo: Conteo[];
  comentario: string;
  votaron: number;
}

export interface EstadoVotacion {
  ronda: { clave: string; pregunta: string; cierra: number; ahora: number };
  puedeVotar: boolean;
  motivo: string | null;
  miVoto: string | null;
  votaron: number;
  total: number;
  jugadores: Votante[];
  resultado: ResultadoRonda | null;
  anterior: ResultadoRonda | null;
  prueba: boolean;
}

export async function estadoVotacion(yo: Jugador): Promise<EstadoVotacion> {
  const ahora = Date.now();
  const est = estadoDe(yo);
  const ronda = rondaEn(yo.seasonId, ahora, yo.prueba, est.dia);
  const previa = rondaEn(yo.seasonId, ahora, yo.prueba, est.dia, -1);
  const [jugadores, votos] = await Promise.all([
    conTope(() => db()`select id, display_name, avatar from cc.players where season_id = ${yo.seasonId} and status = 'active' order by display_name`),
    conTope(() => db()`select round_key, voter_id, target_id from cc.votes where season_id = ${yo.seasonId} and round_key in (${ronda.clave}, ${previa.clave})`),
  ]);
  const lista: Votante[] = jugadores.map((j) => ({ id: j.id, nombre: j.display_name, avatar: avatarValido(j.avatar) }));
  const nombre = (id: string) => lista.find((j) => j.id === id)?.nombre ?? "Alguien";
  const deRonda = (clave: string) => votos.filter((v) => v.round_key === clave).map((v) => ({ voter: v.voter_id as string, target: v.target_id as string }));

  const actuales = deRonda(ronda.clave);
  const miVoto = actuales.find((v) => v.voter === yo.id)?.target ?? null;
  const total = lista.length;
  const visible = revelar(actuales.length, total, ahora, ronda.cierra);
  const resultado = visible
    ? { pregunta: ronda.pregunta.texto, conteo: contar(actuales), comentario: comentario(contar(actuales), nombre, ronda.clave), votaron: actuales.length }
    : null;
  const prev = deRonda(previa.clave);
  const anterior = prev.length ? { pregunta: previa.pregunta.texto, conteo: contar(prev), comentario: comentario(contar(prev), nombre, previa.clave), votaron: prev.length } : null;

  let motivo: string | null = null;
  if (yo.status !== "active") motivo = "Cuando el organizador te apruebe, podrás votar.";
  else if (est.fase === "terminada") motivo = "La temporada terminó.";
  else if (total < 3) motivo = "Hacen falta al menos 3 jugadores aprobados para votar.";

  return {
    ronda: { clave: ronda.clave, pregunta: ronda.pregunta.texto, cierra: ronda.cierra, ahora },
    puedeVotar: motivo === null && !miVoto,
    motivo,
    miVoto,
    votaron: actuales.length,
    total,
    jugadores: lista,
    resultado,
    anterior,
    prueba: yo.prueba,
  };
}

/** Un voto por persona y ronda; nunca por uno mismo. Votar da monedas (una vez, durante la temporada). */
export async function votar(yo: Jugador, clave: unknown, objetivo: unknown) {
  if (yo.status !== "active") throw new ErrorDeUsuario("Cuando el organizador te apruebe, podrás votar.", 403);
  if (typeof objetivo !== "string" || !/^[0-9a-f-]{36}$/i.test(objetivo)) throw new ErrorDeUsuario("Elige a alguien de la lista.");
  if (objetivo === yo.id) throw new ErrorDeUsuario("No puedes votar por ti. Buen intento.");
  const est = estadoDe(yo);
  if (est.fase === "terminada") throw new ErrorDeUsuario("La temporada terminó.", 409);
  const ronda = rondaEn(yo.seasonId, Date.now(), yo.prueba, est.dia);
  if (clave !== ronda.clave) throw new ErrorDeUsuario("La pregunta acaba de cambiar. Mira la nueva y vota otra vez.", 409);

  const sql = db();
  await conTope(
    sql.begin(async (tx) => {
      const [t] = await tx`select id from cc.players where id = ${objetivo} and season_id = ${yo.seasonId} and status = 'active'`;
      if (!t) throw new ErrorDeUsuario("Esa persona no está en la temporada.", 404);
      const [v] = await tx`
        insert into cc.votes (season_id, round_key, question_id, voter_id, target_id)
        values (${yo.seasonId}, ${ronda.clave}, ${ronda.pregunta.id}, ${yo.id}, ${objetivo})
        on conflict (season_id, round_key, voter_id) do nothing
        returning id
      `;
      if (!v) throw new ErrorDeUsuario("Ya votaste en esta pregunta.", 409);
      const monedas = est.fase === "en-curso" ? RECOMPENSA_VOTO.monedas : 0;
      await tx`
        insert into cc.score_ledger (season_id, player_id, team_id, source_type, source_id, coins, reason, idempotency_key)
        values (${yo.seasonId}, ${yo.id}, ${yo.teamId}, 'voto', ${ronda.clave}, ${monedas},
                '¿Quién es más probable…?: votar', ${`voto:${yo.seasonId}:${ronda.clave}:${yo.id}`})
        on conflict (idempotency_key) do nothing
      `;
    }),
    10_000,
    "registro del voto",
  );
  return estadoVotacion(yo);
}
