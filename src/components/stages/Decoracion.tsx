/** Adornos de fondo del tema navideño: nieve, paisaje de Snowville y guirnalda de luces. */

export function FondoNavidad() {
  return (
    <>
      <div className="nevada" aria-hidden />
      <div className="paisaje" aria-hidden>
        <i className="p-montes" />
        <i className="p-pinos" />
      </div>
    </>
  );
}

const COLORES = ["#ff4d5e", "#ffc845", "#4cc38a", "#6fb6ff", "#ff8fd0"];

/** Cable con focos de colores que titilan a destiempo. */
export function Guirnalda({ focos = 22 }: { focos?: number }) {
  const y = (i: number) => 4 + Math.sin((i / (focos - 1)) * Math.PI * 4) * 4 + 6;
  return (
    <div className="guirnalda" aria-hidden>
      <svg viewBox="0 0 100 24" preserveAspectRatio="none">
        <path
          d={`M0 ${y(0)} ` + Array.from({ length: 40 }, (_, k) => `L${((k + 1) / 40) * 100} ${4 + Math.sin(((k + 1) / 40) * Math.PI * 4) * 4 + 6}`).join(" ")}
          fill="none"
          stroke="#3d3a52"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 2 }}
        />
      </svg>
      {Array.from({ length: focos }, (_, i) => (
        <span
          key={i}
          className="foco"
          style={{
            left: `${(i / (focos - 1)) * 100}%`,
            top: `${(y(i) / 24) * 100}%`,
            ["--c" as string]: COLORES[i % COLORES.length],
            ["--d" as string]: `${(i * 0.37) % 2.4}s`,
          }}
        />
      ))}
    </div>
  );
}
