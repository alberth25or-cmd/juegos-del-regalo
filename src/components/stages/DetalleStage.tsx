import Link from "next/link";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cuantas, faltanHoy, type Stage } from "./datosEjemplo";

/**
 * Letrero de madera bajo la aldea: lo que hay dentro de la casa elegida.
 * Todas las casas están abiertas; lo que cambia es si hoy te quedan preguntas nuevas.
 */
export function DetalleStage({ s, id, etiqueta }: { s: Stage; id: string; etiqueta: string }) {
  const titulo = s.n === 6 ? s.nombre : `${s.n}. ${s.nombre}`;
  const cerrada = s.estado === "cerrada";
  const aldia = s.estado === "aldia";
  const faltan = faltanHoy(s);

  return (
    <article id={id} role="tabpanel" aria-labelledby={etiqueta} className="clay letrero relative mx-auto w-full max-w-[560px] px-5 pb-6 pt-6 text-left sm:px-7" tabIndex={-1}>
      <div className="flex items-start gap-4">
        <div className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-[20px]" style={{ background: cerrada ? "#ece7f2" : aldia ? "#e8f6ee" : "#fff1d6" }}>
          <PixelIcon name={cerrada ? "lock" : s.icono} size={40} />
        </div>
        <div className="min-w-0">
          {s.estado === "nuevas" && (
            <span className="pastilla" style={{ ["--pb" as string]: "#ffe3e6", ["--pf" as string]: "var(--rojo-boton)" }}>
              ¡Hoy: {cuantas(faltan, s.unidad)}!
            </span>
          )}
          {aldia && (
            <span className="pastilla" style={{ ["--pb" as string]: "#dff5e9", ["--pf" as string]: "var(--verde)" }}>
              ✓ Al día{s.monedas ? ` · +${s.monedas} monedas` : ""}
            </span>
          )}
          {cerrada && (
            <span className="pastilla" style={{ ["--pb" as string]: "#ece7f2", ["--pf" as string]: "var(--tinta-suave)" }}>
              Se abre el {s.abre}
            </span>
          )}
          <h2 className="f-titulo mt-1.5 text-[1.5rem] font-semibold leading-tight [text-wrap:balance]">{titulo}</h2>
          <p className="mt-1 text-[1rem] leading-relaxed text-[var(--tinta-suave)]">{s.descripcion}</p>
        </div>
      </div>

      {!cerrada && (
        <div className="mt-5">
          <p className="mb-3 flex items-center justify-center gap-1.5 text-center text-[0.9rem] font-bold text-[var(--tinta-suave)]">
            <PixelIcon name="clock" size={16} />
            Hoy: {s.hechasHoy} de {s.porDia} · {aldia ? "a medianoche salen más" : "las de hoy vencen a las 23:59"}
          </p>
          {!s.juegos &&
            (aldia ? (
              <button type="button" className="boton claro w-full" disabled>
                Ya respondiste las de hoy · mañana hay más
              </button>
            ) : s.accion ? (
              <Link href={s.accion.href} className="boton w-full !text-[1.2rem]">
                {s.accion.texto}
              </Link>
            ) : (
              <button type="button" className="boton w-full" disabled>
                Responder · Próximamente en esta vista
              </button>
            ))}
        </div>
      )}

      {cerrada && (
        <button type="button" className="boton mt-5 w-full" disabled>
          Se abre el {s.abre} para todos
        </button>
      )}

      {s.juegos && (
        <ul className="grid grid-cols-3 gap-2">
          {s.juegos.map((j) => (
            <li key={j.nombre}>
              {j.disponible ? (
                <Link href={j.href} className="flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-[16px] bg-white px-1 py-2 text-center text-[0.82rem] font-extrabold leading-tight shadow-[0_0_0_2px_#e2dcea,0_4px_0_#e2dcea] transition-transform hover:-translate-y-0.5">
                  <PixelIcon name={j.icono} size={28} />
                  {j.nombre}
                  <span className="text-[0.72rem] font-bold text-[var(--verde)]">{j.hechoHoy ? "✓ Hecho · jugar" : "Jugar"}</span>
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
