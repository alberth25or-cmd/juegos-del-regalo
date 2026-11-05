/** Azar determinístico (mulberry32): misma semilla → misma secuencia en navegador y servidor. */
export function crearAzar(seed: number) {
  let a = seed >>> 0;
  return function siguiente() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mezcla Fisher–Yates con una función de azar dada (no muta el original). */
export function mezclar<T>(lista: readonly T[], azar: () => number): T[] {
  const out = [...lista];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
