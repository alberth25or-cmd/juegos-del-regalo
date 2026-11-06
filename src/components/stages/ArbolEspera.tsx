import { PixelSprite } from "@/components/rpg/PixelSprite";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { crearAzar, mezclar } from "@/features/azar";
import { Cabeza } from "./Cabeza";
import type { Agente } from "./datosEjemplo";

const W = 32;
const H = 40;
const CX = W / 2;
const PISOS = [
  { y0: 3, y1: 13, a0: 1, a1: 7 },
  { y0: 11, y1: 23, a0: 3, a1: 11 },
  { y0: 21, y1: 35, a0: 5, a1: 15 },
];

/** Mitad del ancho del árbol en la fila y (0 = fuera del follaje). */
function mitad(y: number) {
  let m = 0;
  for (const p of PISOS) if (y >= p.y0 && y <= p.y1) m = Math.max(m, p.a0 + ((y - p.y0) / (p.y1 - p.y0)) * (p.a1 - p.a0));
  return Math.round(m);
}

const FILAS: string[] = Array.from({ length: H }, (_, y) => {
  let fila = "";
  for (let x = 0; x < W; x++) {
    const dx = x + 0.5 - CX;
    if (y <= 2) fila += Math.abs(dx) < (y === 1 ? 2 : 1) ? "Y" : ".";
    else if (y >= 35) fila += Math.abs(dx) < 3 ? "B" : ".";
    else {
      const m = mitad(y);
      fila += Math.abs(dx) < m ? (dx < -m + 2 ? "g" : "G") : ".";
    }
  }
  return fila;
});
const ARBOL = { rows: FILAS, colors: { Y: "#f6b93b", G: "#1f7a58", g: "#2e9e78", B: "#8a5a3b" } };

const FILAS_ADORNO = [9, 13, 17, 21, 25, 29, 33];

/** Reparte `n` huecos en las filas del árbol, más huecos donde es más ancho. Devuelve % del dibujo. */
function huecos(n: number): { x: number; y: number }[] {
  const anchos = FILAS_ADORNO.map((y) => Math.max(1, mitad(y) * 2 - 4));
  const suma = anchos.reduce((a, b) => a + b, 0);
  const cuenta = anchos.map((a) => Math.floor((a / suma) * n));
  for (let i = cuenta.length - 1; cuenta.reduce((a, b) => a + b, 0) < n; i = (i - 1 + cuenta.length) % cuenta.length) cuenta[i]++;
  const out: { x: number; y: number }[] = [];
  FILAS_ADORNO.forEach((y, i) => {
    const m = mitad(y) - 2;
    for (let k = 0; k < cuenta[i]; k++) {
      const x = cuenta[i] === 1 ? CX : CX - m + (k * 2 * m) / (cuenta[i] - 1);
      out.push({ x: ((x + 1) / (W + 2)) * 100, y: ((y + 1) / (H + 2)) * 100 });
    }
  });
  return out;
}

/** Sala de espera: un árbol con la cabeza de cada agente inscrito y huecos libres hasta la capacidad. */
export function ArbolEspera({ agentes, capacidad }: { agentes: Agente[]; capacidad: number }) {
  // El orden se mezcla por alias para no revelar el orden de inscripción.
  const colgados = [...agentes].sort((a, b) => a.alias.localeCompare(b.alias));
  // Los huecos se reparten al azar (semilla fija) para que los libres no queden todos abajo.
  const lugares = mezclar(huecos(capacidad), crearAzar(capacidad));
  return (
    <figure className="relative mx-auto w-full max-w-[380px]" aria-label={`${agentes.length} de ${capacidad} agentes en el árbol`}>
      <PixelSprite sprite={ARBOL} size={380} className="!h-auto !w-full" />
      {lugares.map((p, i) => {
        const a = colgados[i];
        return (
          <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            {a ? (
              <span className={a.yo ? "relative z-10 block" : "block"}>
                <Cabeza config={a.avatar} size={a.yo ? 22 : 19} bola yo={a.yo} title={a.yo ? "Tú" : undefined} />
              </span>
            ) : (
              <span className="block h-[26px] w-[26px] rounded-full border-2 border-dashed border-white/60 bg-white/10" aria-hidden />
            )}
          </span>
        );
      })}
      <span className="anim-twinkle absolute left-1/2 top-0 -translate-x-1/2" aria-hidden>
        <PixelIcon name="star" size={34} />
      </span>
    </figure>
  );
}
