/**
 * Convierte arte pixel por filas en UN trazo SVG por color (en vez de un
 * <rect> por pixel). Se ve idéntico y usa decenas de veces menos elementos,
 * lo que importa mucho en celulares básicos.
 */
export function pixelPaths(rows: readonly string[], colors: Record<string, string>, offset = 0): { fill: string; d: string }[] {
  const byColor = new Map<string, string[]>();
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === "." || c === " " || !colors[c]) {
        x++;
        continue;
      }
      let run = 1;
      while (row[x + run] === c) run++;
      const list = byColor.get(c) ?? [];
      list.push(`M${x + offset} ${y + offset}h${run}v1h-${run}z`);
      byColor.set(c, list);
      x += run;
    }
  });
  return [...byColor.entries()].map(([c, parts]) => ({ fill: colors[c], d: parts.join("") }));
}
