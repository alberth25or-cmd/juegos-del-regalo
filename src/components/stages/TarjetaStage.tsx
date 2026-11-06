import Link from "next/link";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Stage } from "./datosEjemplo";

const ALTO = "min-h-[430px] lg:min-h-[460px]";

/**
 * Cada stage es un regalo: envuelto con su etiqueta de fecha mientras está bloqueado,
 * abierto con su botón cuando toca, y con sus juegos a mano cuando ya lo superaste.
 */
export function TarjetaStage({ s, enfocada }: { s: Stage; enfocada: boolean }) {
  const titulo = s.n === 6 ? s.nombre : `${s.n}. ${s.nombre}`;
  const tab = enfocada ? 0 : -1;

  if (s.estado === "bloqueado") {
    return (
      <article className={`papel-regalo ${s.papel === "rojo" ? "" : s.papel} relative flex ${ALTO} flex-col items-center justify-center rounded-[24px] px-6 text-center shadow-[0_10px_0_-2px_rgb(9_16_50/0.55),0_22px_40px_-10px_rgb(0_0_0/0.5)]`} aria-label={`${titulo}. Se abre el ${s.abre}.`}>
        <span className="absolute -top-[30px] left-1/2 -translate-x-1/2" aria-hidden>
          <PixelIcon name="bowOro" size={84} />
        </span>
        <div className="etiqueta-regalo">
          <PixelIcon name="lock" size={22} />
          <span className="f-titulo text-[1.25rem] font-semibold leading-tight">{titulo}</span>
          <span className="text-[0.9rem] font-bold text-[var(--tinta-suave)]">Se abre el {s.abre}</span>
        </div>
      </article>
    );
  }

  const actual = s.estado === "actual";
  return (
    <article className={`clay relative flex ${ALTO} flex-col items-center px-6 pb-7 pt-10 text-center`} aria-label={actual ? `${titulo}. Toca hoy.` : `${titulo}. Superado.`}>
      {/* Cinta superior del regalo abierto */}
      <span className="absolute inset-x-0 top-0 h-[14px] rounded-t-[24px]" style={{ background: actual ? "var(--rojo-boton)" : "var(--verde)" }} aria-hidden />
      <span className="absolute -top-[30px] left-1/2 -translate-x-1/2" aria-hidden>
        <PixelIcon name={actual ? "bow" : "bowOro"} size={84} />
      </span>

      {actual ? (
        <span className="pastilla mb-3" style={{ ["--pb" as string]: "#ffe3e6", ["--pf" as string]: "var(--rojo-boton)" }}>
          ¡Toca hoy!
        </span>
      ) : (
        <span className="pastilla mb-3" style={{ ["--pb" as string]: "#dff5e9", ["--pf" as string]: "var(--verde)" }}>
          ✓ Superado · +{s.puntos} pts
        </span>
      )}

      <div className={`grid h-[96px] w-[96px] place-items-center rounded-[26px] ${actual && enfocada ? "flotar" : ""}`} style={{ background: actual ? "#fff1d6" : "#e8f6ee" }}>
        <PixelIcon name={s.icono} size={60} />
      </div>

      <h2 className="f-titulo mt-4 text-[1.75rem] font-semibold leading-tight [text-wrap:balance]">{titulo}</h2>
      <p className="mt-2 max-w-[30ch] text-[1rem] leading-relaxed text-[var(--tinta-suave)]">{s.descripcion}</p>

      <div className="mt-auto w-full pt-5">
        {actual && s.accion && (
          <>
            <p className="mb-3 flex items-center justify-center gap-1.5 text-[0.9rem] font-bold text-[var(--tinta-suave)]">
              <PixelIcon name="clock" size={16} /> {s.avance}
            </p>
            <Link href={s.accion.href} className="boton w-full !text-[1.25rem]" tabIndex={tab}>
              {s.accion.texto}
            </Link>
          </>
        )}
        {!actual && s.juegos && (
          <ul className="grid grid-cols-3 gap-2">
            {s.juegos.map((j) => (
              <li key={j.nombre}>
                {j.disponible ? (
                  <Link href={j.href} tabIndex={tab} className="flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-[16px] bg-white px-1 py-2 text-[0.82rem] font-extrabold leading-tight shadow-[0_0_0_2px_#e2dcea,0_4px_0_#e2dcea] transition-transform hover:-translate-y-0.5">
                    <PixelIcon name={j.icono} size={28} />
                    {j.nombre}
                    <span className="text-[0.72rem] font-bold text-[var(--verde)]">Jugar</span>
                  </Link>
                ) : (
                  <span className="flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-[16px] bg-[#f1edf5] px-1 py-2 text-[0.82rem] font-extrabold leading-tight text-[var(--tinta-suave)]" aria-disabled="true">
                    <PixelIcon name={j.icono} size={28} />
                    {j.nombre}
                    <span className="text-[0.68rem] font-bold">{j.nota}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
