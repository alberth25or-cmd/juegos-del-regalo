/** Cómo se muestran presupuesto y premio (null = lo decide el grupo fuera del juego). */
export const textoPresupuesto = (p: number | null) => (p === null ? "lo acuerda el grupo fuera del juego" : `S/${p}`);
export const textoPremio = (p: string | null) => (p === null ? "lo decide el grupo fuera del juego" : p);
