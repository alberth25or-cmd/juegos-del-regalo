import Link from "next/link";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Stage } from "./datosEjemplo";

/** Letrero de madera bajo la aldea: lo que hay dentro de la casa elegida. */
export function DetalleStage({ s, id, etiqueta }: { s: Stage; id: string; etiqueta: string }) {
  const titulo = s.n === 6 ? s.nombre : `${s.n}. ${s.nombre}`;
  const actual = s.estado === "actual";
  const bloqueado = s.estado === "bloqueado";

  return (
    <article id={id} role="tabpanel" aria-labelledby={etiqueta} className="clay letrero relative mx-auto w-full max-w-[560px] px-5 pb-6 pt-6 text-left sm:px-7" tabIndex={-1}>
      <div className="flex items-start gap-4">
        <div className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-[20px]" style={{ background: bloqueado ? "#ece7f2" : actual ? "#fff1d6" : "#e8f6ee" }}>
          <PixelIcon name={bloqueado ? "lock" : s.icono} size={40} />
        </div>
        <div className="min-w-0">
          {actual && (
            <span className="pastilla" style={{ ["--pb" as string]: "#ffe3e6", ["--pf" as string]: "var(--rojo-boton)" }}>
              ¡Toca hoy!
            </span>
          )}
          {s.estado === "superado" && (
            <span className="pastilla" style={{ ["--pb" as string]: "#dff5e9", ["--pf" as string]: "var(--verde)" }}>
              ✓ Superado · +{s.puntos} pts
            </span>
          )}
          {bloqueado && (
            <span className="pastilla" style={{ ["--pb" as string]: "#ece7f2", ["--pf" as string]: "var(--tinta-suave)" }}>
              Se abre el {s.abre}
            </span>
          )}
          <h2 className="f-titulo mt-1.5 text-[1.5rem] font-semibold leading-tight [text-wrap:balance]">{titulo}</h2>
          <p className="mt-1 text-[1rem] leading-relaxed text-[var(--tinta-suave)]">{s.descripcion}</p>
        </div>
      </div>

      {actual && s.accion && (
        <div className="mt-5">
          <p className="mb-3 flex items-center justify-center gap-1.5 text-[0.9rem] font-bold text-[var(--tinta-suave)]">
            <PixelIcon name="clock" size={16} /> {s.avance}
          </p>
          <Link href={s.accion.href} className="boton w-full !text-[1.2rem]">
            {s.accion.texto}
          </Link>
        </div>
      )}

      {bloqueado && (
        <button type="button" className="boton mt-5 w-full" disabled>
          Se abre el {s.abre}
        </button>
      )}

      {s.estado === "superado" && s.juegos && (
        <ul className="mt-5 grid grid-cols-3 gap-2">
          {s.juegos.map((j) => (
            <li key={j.nombre}>
              {j.disponible ? (
                <Link href={j.href} className="flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-[16px] bg-white px-1 py-2 text-center text-[0.82rem] font-extrabold leading-tight shadow-[0_0_0_2px_#e2dcea,0_4px_0_#e2dcea] transition-transform hover:-translate-y-0.5">
                  <PixelIcon name={j.icono} size={28} />
                  {j.nombre}
                  <span className="text-[0.72rem] font-bold text-[var(--verde)]">Jugar</span>
                </Link>
              ) : (
                <span className="flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-[16px] bg-[#f1edf5] px-1 py-2 text-center text-[0.82rem] font-extrabold leading-tight text-[var(--tinta-suave)]" aria-disabled="true">
                  <PixelIcon name={j.icono} size={28} />
                  {j.nombre}
                  <span className="text-[0.68rem] font-bold">{j.nota}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
