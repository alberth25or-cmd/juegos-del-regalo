"use client";

import type { ComponentType } from "react";
import { CALENDARIO, ULTIMO_DIA } from "@/lib/sim/contenido";
import { hecho, type SimState } from "@/lib/sim/store";
import { AdivinaQuien, CazaTraidor, EmojiResumen, FotoMision, MemeSecreto, PalabraSecreta, PuertaDelDia, Trivia, VerdadOMentira, VotarFotos } from "./juegosDiarios";
import {
  Acertijo,
  AgenteDoble,
  Apuesta,
  Calendario,
  Capsula,
  Comodines,
  Cumplidos,
  Custodio,
  Duelo,
  Fogata,
  GranFinal,
  Insignias,
  MiAmigoSecreto,
  Mosaico,
  Muneco,
  Pozo,
  QuienTeRegala,
  RankingSim,
  Rescate,
  QueNoDespierte,
  Wishlist,
} from "./juegosExtra";

export interface JuegoDef {
  emoji: string;
  titulo: string;
  C: ComponentType<{ s: SimState }>;
  /** juegos que se hacen una sola vez en la temporada */
  unaVez?: boolean;
}

export const JUEGOS: Record<string, JuegoDef> = {
  puerta: { emoji: "🎄", titulo: "Abrir la puerta del día", C: PuertaDelDia },
  foto: { emoji: "📸", titulo: "Foto misión", C: FotoMision },
  votacion: { emoji: "🖼️", titulo: "Votar la foto de ayer", C: VotarFotos },
  verdad: { emoji: "🤥", titulo: "Verdad o mentira", C: VerdadOMentira },
  emoji: { emoji: "🤪", titulo: "Emoji resumen", C: EmojiResumen },
  palabra: { emoji: "🤫", titulo: "Palabra secreta", C: PalabraSecreta },
  trivia: { emoji: "🧠", titulo: "Trivia del grupo", C: Trivia },
  adivina: { emoji: "🎭", titulo: "Adivina quién", C: AdivinaQuien },
  traidor: { emoji: "🔍", titulo: "Caza al traidor", C: CazaTraidor },
  meme: { emoji: "😂", titulo: "Meme al amigo secreto", C: MemeSecreto },
  ranking: { emoji: "🏆", titulo: "Ranking", C: RankingSim },
  apuesta: { emoji: "🎲", titulo: "Apuesta del día", C: Apuesta },
  comodines: { emoji: "🛡️", titulo: "Comodines", C: Comodines },
  ogro: { emoji: "😴", titulo: "¡Que no despierte!", C: QueNoDespierte },
  acertijo: { emoji: "🧩", titulo: "Acertijo del ogro", C: Acertijo },
  rescate: { emoji: "🎁", titulo: "Rescata el regalo", C: Rescate, unaVez: true },
  sorteo: { emoji: "📮", titulo: "Mi amigo secreto", C: MiAmigoSecreto, unaVez: true },
  sospecha: { emoji: "❓", titulo: "¿Quién te regala?", C: QuienTeRegala, unaVez: true },
  wishlist: { emoji: "📝", titulo: "Mis pistas y wishlist", C: Wishlist, unaVez: true },
  capsula: { emoji: "⏳", titulo: "Cápsula del tiempo", C: Capsula, unaVez: true },
  custodio: { emoji: "🗳️", titulo: "Votar al custodio", C: Custodio, unaVez: true },
  cumplidos: { emoji: "💌", titulo: "Cadena de cumplidos", C: Cumplidos, unaVez: true },
  duelo: { emoji: "☃️", titulo: "Duelo de dos", C: Duelo, unaVez: true },
  doble: { emoji: "🕶️", titulo: "Agente doble", C: AgenteDoble, unaVez: true },
  muneco: { emoji: "⛄", titulo: "Muñeco gigante", C: Muneco },
  mosaico: { emoji: "🖼️", titulo: "Mosaico del grupo", C: Mosaico },
  fogata: { emoji: "🔥", titulo: "Fogata del equipo", C: Fogata },
  insignias: { emoji: "🏅", titulo: "Insignias", C: Insignias },
  calendario: { emoji: "🎄", titulo: "Calendario de adviento", C: Calendario },
  pozo: { emoji: "💰", titulo: "El pozo", C: Pozo },
  final: { emoji: "🏆", titulo: "Gran final", C: GranFinal },
};

/** Tarjetas de las zonas → juego del modo prueba. */
export const TARJETA_A_JUEGO: Record<string, string> = {
  foto: "foto", palabra: "palabra", verdad: "verdad", muro: "votacion", emoji: "emoji", meme: "meme",
  ranking: "ranking", apuestas: "apuesta", comodines: "comodines", cumplidos: "cumplidos", duelo: "duelo", capsula: "capsula",
  amigo: "sorteo", quien: "sospecha", trivia: "trivia", doble: "doble", traidor: "traidor", adivina: "adivina",
  sigilo: "ogro", acertijos: "acertijo", rescate: "rescate", muneco: "muneco", mosaico: "mosaico", fogata: "fogata",
  insignias: "insignias", pistas: "wishlist", calendario: "calendario", pozo: "pozo", custodio: "custodio", final: "final",
};

export function estaHecho(s: SimState, id: string) {
  if (JUEGOS[id]?.unaVez) return Object.keys(s.done).some((k) => k.startsWith(`${id}:`));
  return Boolean(hecho(s, id));
}

export interface Tarea {
  id: string;
  tipo: "principal" | "votar" | "semanal" | "extra";
  nota?: string;
}

/** Lo que te toca hoy, según el calendario de la temporada. */
export function tuDia(s: SimState): Tarea[] {
  const d = s.day;
  if (d === 0) {
    return [
      { id: "wishlist", tipo: "principal", nota: "Antes del sorteo" },
      { id: "custodio", tipo: "principal" },
      { id: "capsula", tipo: "semanal", nota: "+30" },
      { id: "sorteo", tipo: "principal", nota: "Revela a quién le regalas" },
    ];
  }
  if (d === ULTIMO_DIA) return [{ id: "final", tipo: "principal" }];
  const t: Tarea[] = [
    { id: "puerta", tipo: "principal", nota: "Nueva pista" },
    { id: CALENDARIO[d], tipo: "principal", nota: "Misión del día" },
  ];
  if (CALENDARIO[d - 1] === "foto") t.push({ id: "votacion", tipo: "votar", nota: "Vota la foto de ayer" });
  if (d <= 7) t.push({ id: "cumplidos", tipo: "semanal", nota: "Semanal · hasta el día 7" });
  else t.push({ id: "duelo", tipo: "semanal", nota: "Semanal · hasta el día 13" });
  if (d === 10) t.push({ id: "rescate", tipo: "extra", nota: "¡Solo hoy!" });
  if (d >= 2) t.push({ id: "doble", tipo: "extra", nota: "Misión secreta" });
  t.push({ id: "apuesta", tipo: "extra" }, { id: "ogro", tipo: "extra", nota: "1 intento" }, { id: "acertijo", tipo: "extra" }, { id: "sospecha", tipo: "extra", nota: "1 solo intento" });
  return t;
}
