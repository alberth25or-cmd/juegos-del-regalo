/**
 * Datos de ejemplo mientras no exista la base de datos.
 * La forma imita lo que devolverá el servidor (multi-grupo).
 */

export type HotspotState = "locked" | "available" | "pending" | "done";

export const mockGroup = {
  id: "grupo-demo",
  name: "Los Agentes del Panetón",
  day: 3,
  totalDays: 14,
  giftDate: "2026-12-12T19:00:00-05:00",
  pot: 150,
  paid: 11,
  members: 15,
  completedToday: 9,
};

export const mockMe = {
  id: "m1",
  alias: "Luis",
  codename: "Agente Mantequilla",
  points: 140,
  rank: 4,
  streak: 3,
  powerups: { escudo: 1, robar: 0, doble: 1 },
};

export const mockChallenge = {
  id: "c3",
  type: "foto" as const,
  title: "Foto misión",
  description: "Tómale foto a algo rojo que tengas cerca. Sin trampa, agente.",
  points: 10,
  closesAt: "23:59",
};

export const mockRanking = [
  { id: "m7", codename: "Agente Chocotón", points: 185, move: 1, color: "var(--cherry)" },
  { id: "m3", codename: "Agente Pisco Sour", points: 170, move: -1, color: "var(--pine)" },
  { id: "m9", codename: "La Infiltrada", points: 152, move: 2, color: "var(--lavender)" },
  { id: "m1", codename: "Agente Mantequilla", points: 140, move: 0, color: "var(--gold)" },
  { id: "m5", codename: "Doble Ají", points: 133, move: 3, color: "var(--rose)" },
  { id: "m2", codename: "Cuy Clasificado", points: 120, move: -2, color: "var(--sky)" },
  { id: "m8", codename: "Agente Panetón", points: 118, move: 0, color: "var(--mint)" },
];

export const mockHotspots: Record<string, HotspotState> = {
  "casa-misiones": "pending",
  "tablero-plaza": "available",
  arbol: "available",
  buzon: "pending",
  cofre: "available",
};
