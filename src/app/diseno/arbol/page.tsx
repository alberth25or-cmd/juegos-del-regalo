import { ArbolEspera } from "@/components/stages/ArbolEspera";
import { AGENTES, SALA, YO } from "@/components/stages/datosEjemplo";
import { PixelIcon } from "@/components/ui/PixelIcon";

const INSCRITOS = AGENTES.slice(0, 14).concat(AGENTES.slice(0, 14).some((a) => a.yo) ? [] : [YO]);

export default function ArbolDiseno() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 pb-10 pt-6 lg:flex-row lg:items-start lg:justify-center lg:gap-14 lg:pt-12">
      <ArbolEspera agentes={INSCRITOS} capacidad={SALA.capacidad} />
      <div className="w-full max-w-sm text-center lg:pt-16 lg:text-left">
        <p className="font-pixel text-[0.85rem] text-[var(--texto-suave)]">SALA DE ESPERA</p>
        <h1 className="mt-1 font-pixel text-[1.7rem] leading-tight">El árbol se está llenando</h1>
        <p className="mt-4 font-pixel text-[2.6rem] leading-none text-[var(--gold)]">
          {INSCRITOS.length}<span className="text-[1.4rem] text-[var(--texto-suave)]">/{SALA.capacidad}</span>
        </p>
        <p className="text-[var(--texto-suave)]">agentes inscritos</p>
        <div className="mt-3 flex flex-wrap justify-center gap-[5px] lg:justify-start" aria-hidden>
          {Array.from({ length: SALA.capacidad }, (_, i) => (
            <span key={i} className="bulb" data-on={i < INSCRITOS.length ? "1" : "0"} />
          ))}
        </div>
        <ul className="mt-6 flex flex-col gap-2 text-left text-[0.95rem]">
          <li className="flex items-center gap-2"><PixelIcon name="check" size={16} /> Tu ficha está completa, {YO.alias}.</li>
          <li className="flex items-center gap-2"><PixelIcon name="clock" size={16} /> Nadie juega hasta que el organizador aprieta &quot;Empezar&quot;.</li>
          <li className="flex items-center gap-2"><PixelIcon name="lock" size={16} /> Al empezar se hace el sorteo y se cierra la puerta.</li>
        </ul>
      </div>
    </main>
  );
}
