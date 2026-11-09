import { ArbolEspera } from "@/components/stages/ArbolEspera";
import { Guirnalda } from "@/components/stages/Decoracion";
import { AGENTES, SALA, YO } from "@/components/stages/datosEjemplo";
import { PixelIcon } from "@/components/ui/PixelIcon";

const INSCRITOS = AGENTES.slice(0, 14).concat(AGENTES.slice(0, 14).some((a) => a.yo) ? [] : [YO]);

export default function ArbolDiseno() {
  const faltan = SALA.capacidad - INSCRITOS.length;
  return (
    <>
      <Guirnalda />
      <main className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 pb-56 pt-4 lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:pt-10">
        <ArbolEspera agentes={INSCRITOS} capacidad={SALA.capacidad} />

        <section className="clay w-full max-w-sm p-6 text-center lg:text-left">
          <p className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-[var(--verde)]">Sala de espera</p>
          <h1 className="f-titulo mt-1 text-[2rem] font-semibold leading-tight [text-wrap:balance]">¡El árbol se está llenando!</h1>

          <div className="mt-4 flex items-end justify-center gap-2 lg:justify-start">
            <span className="f-titulo text-[3.4rem] font-bold leading-none text-[var(--rojo-boton)]">{INSCRITOS.length}</span>
            <span className="pb-1.5 text-[1.1rem] font-extrabold text-[var(--tinta-suave)]">de {SALA.capacidad} agentes</span>
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#efe8f3]" role="progressbar" aria-valuenow={INSCRITOS.length} aria-valuemin={0} aria-valuemax={SALA.capacidad} aria-label="Agentes inscritos">
            <div className="h-full rounded-full" style={{ width: `${(INSCRITOS.length / SALA.capacidad) * 100}%`, background: "repeating-linear-gradient(-45deg, #e8283c 0 10px, #ff5a6b 10px 20px)" }} />
          </div>
          <p className="mt-2 text-[0.9rem] font-bold text-[var(--tinta-suave)]">Faltan {faltan} lugares</p>

          <ul className="mt-5 flex flex-col gap-2.5 text-left text-[0.95rem] font-semibold">
            <li className="flex items-start gap-2.5 rounded-[14px] bg-[#e8f6ee] px-3 py-2.5">
              <PixelIcon name="check" size={18} className="mt-0.5 shrink-0" /> Tu ficha está lista, {YO.alias}.
            </li>
            <li className="flex items-start gap-2.5 rounded-[14px] bg-[#fff1d6] px-3 py-2.5">
              <PixelIcon name="clock" size={18} className="mt-0.5 shrink-0" /> Nadie juega hasta que el organizador apriete &quot;Empezar&quot;.
            </li>
            <li className="flex items-start gap-2.5 rounded-[14px] bg-[#ffe3e6] px-3 py-2.5">
              <PixelIcon name="lock" size={18} className="mt-0.5 shrink-0" /> Al empezar se hace el sorteo, se cierra la puerta y se abren todas las casas.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
