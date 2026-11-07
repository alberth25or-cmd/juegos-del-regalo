/**
 * Arreglos chiptune de villancicos de DOMINIO PÚBLICO (melodías del siglo XIX o anteriores
 * / Shchedryk de Leontovych, 1916). Los arreglos (bajo, tempo, timbre) son nuestros.
 *
 * Formato de cada voz: tokens separados por espacios, `NOTA[:pulsos]` (pulso = negra,
 * 1 por defecto) o `-[:pulsos]` para silencio. Ej.: "E5 E5 E5:2 -:0.5".
 * La melodía y el bajo de una pista deben durar lo mismo (se repiten en bucle).
 */
export type NombrePista = "nieve" | "casa" | "juego";

export interface Pista {
  titulo: string;
  bpm: number;
  melodia: string;
  bajo: string;
  /** golpecito de ruido en cada pulso (para los minijuegos) */
  ritmo?: boolean;
  onda: OscillatorType;
}

// ------------------------------------------------ Jingle Bells (estribillo), Do mayor 4/4
const JB_ESTRIBILLO = [
  "E5 E5 E5:2",
  "E5 E5 E5:2",
  "E5 G5 C5:1.5 D5:0.5",
  "E5:4",
  "F5 F5 F5:1.5 F5:0.5",
  "F5 E5 E5 E5:0.5 E5:0.5",
  "E5 D5 D5 E5",
  "D5:2 G5:2",
  "E5 E5 E5:2",
  "E5 E5 E5:2",
  "E5 G5 C5:1.5 D5:0.5",
  "E5:4",
  "F5 F5 F5:1.5 F5:0.5",
  "F5 E5 E5 E5:0.5 E5:0.5",
  "G5 G5 F5 D5",
  "C5:4",
].join(" ");

const BAJO_4: Record<string, string> = {
  C: "C3 G3 C3 G3",
  F: "F3 C4 F3 C4",
  G: "G2 D3 G2 D3",
  D: "D3 A3 D3 A3",
};
const JB_ACORDES = ["C", "C", "C", "C", "F", "C", "D", "G", "C", "C", "C", "C", "F", "C", "G", "C"];

// ------------------------------------- We Wish You a Merry Christmas, Do mayor 3/4
// (la anacrusa «We» va al final de la vuelta para que el bucle empalme)
const WW_MELODIA = [
  "C5 C5:0.5 D5:0.5 C5:0.5 B4:0.5",
  "A4 A4 A4",
  "D5 D5:0.5 E5:0.5 D5:0.5 C5:0.5",
  "B4 G4 G4",
  "E5 E5:0.5 F5:0.5 E5:0.5 D5:0.5",
  "C5 A4 G4:0.5 G4:0.5",
  "A4 D5 B4",
  "C5:2 G4",
].join(" ");
const BAJO_3: Record<string, string> = {
  C: "C3 G3 G3",
  F: "F3 C4 C4",
  D: "D3 A3 A3",
  G: "G2 D3 D3",
  E: "E3 B3 B3",
  Am: "A2 E3 E3",
  FG: "F3 F3 G3",
};
const WW_ACORDES = ["C", "F", "D", "G", "E", "Am", "FG", "C"];

// ------------------------------------------------ Carol of the Bells, Sol menor 3/4
const motivo = (a: string, b: string, c: string) => `${a} ${b}:0.5 ${a}:0.5 ${c}`;
const CB_MELODIA = [
  ...Array(4).fill(motivo("Bb4", "A4", "G4")),
  ...Array(4).fill(motivo("D5", "C5", "Bb4")),
  ...Array(2).fill(motivo("Eb5", "D5", "C5")),
  ...Array(2).fill(motivo("D5", "C5", "Bb4")),
].join(" ");
const CB_BAJO = Array(3).fill("G2:3 F2:3 Eb2:3 D2:3").join(" ");

export const PISTAS: Record<NombrePista, Pista> = {
  nieve: { titulo: "Jingle Bells", bpm: 150, melodia: JB_ESTRIBILLO, bajo: JB_ACORDES.map((a) => BAJO_4[a]).join(" "), onda: "square" },
  casa: { titulo: "We Wish You a Merry Christmas", bpm: 128, melodia: WW_MELODIA, bajo: WW_ACORDES.map((a) => BAJO_3[a]).join(" "), onda: "triangle" },
  juego: { titulo: "Carol of the Bells", bpm: 172, melodia: CB_MELODIA, bajo: CB_BAJO, ritmo: true, onda: "square" },
};

export interface Nota {
  /** frecuencia en Hz; null = silencio */
  f: number | null;
  pulsos: number;
}

const SEMITONO: Record<string, number> = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };

export function frecuencia(nombre: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(nombre);
  if (!m) throw new Error(`Nota inválida: ${nombre}`);
  const semis = SEMITONO[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * 2 ** (semis / 12);
}

export function leerVoz(voz: string): Nota[] {
  return voz
    .trim()
    .split(/\s+/)
    .map((t) => {
      const [n, d] = t.split(":");
      const pulsos = d ? Number(d) : 1;
      if (!(pulsos > 0)) throw new Error(`Duración inválida: ${t}`);
      return { f: n === "-" ? null : frecuencia(n), pulsos };
    });
}

export function duracion(notas: Nota[]) {
  return notas.reduce((a, n) => a + n.pulsos, 0);
}
