import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Stage } from "./datosEjemplo";

const BORDE = { superado: "var(--ok)", actual: "var(--gold)", bloqueado: "var(--linea)" } as const;

/** Una tarjeta grande por stage. Bloqueado = se puede mirar, no abrir. */
export function TarjetaStage({ s, enfocada }: { s: Stage; enfocada: boolean }) {
  const titulo = s.n === 6 ? s.nombre : `${s.n} · ${s.nombre}`;
  return (
    <article
      className="px-panel flex min-h-[400px] flex-col items-center px-5 pb-6 pt-7 text-center lg:min-h-[440px]"
      style={{ ["--bc" as string]: BORDE[s.estado], ["--bg" as string]: s.estado === "bloqueado" ? "#132245" : "var(--noche-2)" }}
      aria-label={`${titulo}: ${s.estado === "bloqueado" ? `se abre el ${s.abre}` : s.estado}`}
    >
      <div className={`grid h-[112px] w-[112px] place-items-center ${s.estado === "actual" && enfocada ? "anim-bob" : ""}`} style={{ background: "rgb(0 0 0 / 0.18)" }}>
        <PixelIcon name={s.estado === "bloqueado" ? "lock" : s.icono} size={s.estado === "bloqueado" ? 56 : 72} />
      </div>

      <h2 className="mt-5 font-pixel text-[1.45rem] leading-tight [text-wrap:balance]">{titulo}</h2>
      <p className="mt-2 max-w-[30ch] text-[0.95rem] leading-relaxed text-[var(--texto-suave)]">{s.descripcion}</p>

      <div className="mt-auto w-full pt-5">
        {s.estado === "superado" && (
          <>
            <p className="px-chip" style={{ ["--chip" as string]: "#1d4a3a", color: "var(--ok)" }}>
              <PixelIcon name="check" size={14} /> Superado · {s.puntos} pts
            </p>
            {s.accion && (
              <button type="button" className="px-btn mt-4 w-full" style={{ ["--bg" as string]: "var(--noche-3)", color: "var(--cream)" }} tabIndex={enfocada ? 0 : -1}>
                {s.accion}
              </button>
            )}
          </>
        )}
        {s.estado === "actual" && (
          <>
            <p className="flex items-center justify-center gap-1.5 text-[0.85rem] text-[var(--texto-suave)]">
              <PixelIcon name="clock" size={16} /> {s.avance}
            </p>
            <button type="button" className="px-btn mt-4 w-full !text-[1.15rem]" style={{ ["--bg" as string]: "var(--cta)", color: "var(--cream)" }} tabIndex={enfocada ? 0 : -1}>
              {s.accion}
            </button>
          </>
        )}
        {s.estado === "bloqueado" && (
          <button type="button" className="px-btn w-full" disabled tabIndex={-1} style={{ ["--bg" as string]: "var(--noche)", color: "var(--texto-suave)" }}>
            <PixelIcon name="lock" size={16} /> Se abre el {s.abre}
          </button>
        )}
      </div>
    </article>
  );
}
