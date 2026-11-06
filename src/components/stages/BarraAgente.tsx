import { PixelIcon } from "@/components/ui/PixelIcon";
import { Cabeza } from "./Cabeza";
import { Guirnalda } from "./Decoracion";
import { plato, type Agente, type Stage } from "./datosEjemplo";

const MAX_CABEZAS = 3;
const MEDALLA = ["#ffc845", "#d7dde8", "#e59a5b"];

/** Barra superior fija de las pantallas de juego: quién eres, cómo vas, dónde va cada agente y el ranking. */
export function BarraAgente({ yo, puesto, agentes, stages }: { yo: Agente; puesto: number; agentes: Agente[]; stages: Stage[] }) {
  const total = agentes.length;
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-[rgb(11_22_64/0.88)] backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-3 px-4 pb-1 pt-3 lg:grid-cols-[250px_1fr_290px] lg:items-center lg:px-7 lg:pt-4">
          {/* Quién eres */}
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <div className="flex items-center gap-3">
              <Cabeza config={yo.avatar} size={30} yo title="Tu cabeza" />
              <div>
                <p className="f-titulo text-[1.2rem] font-semibold leading-tight">{yo.alias}</p>
                <p className="text-[0.85rem] font-semibold text-[var(--hielo)]">
                  Puesto {puesto} de {total}
                </p>
              </div>
            </div>
            <p className="pastilla lg:hidden" aria-label={`${yo.puntos} puntos`}>
              <PixelIcon name="coin" size={16} /> {yo.puntos} pts
            </p>
          </div>

          <Riel agentes={agentes} stages={stages} />

          <Ranking agentes={agentes} puesto={puesto} yo={yo} />
        </div>
      </div>
      <Guirnalda />
    </header>
  );
}

function Riel({ agentes, stages }: { agentes: Agente[]; stages: Stage[] }) {
  const pos = (n: number) => 9 + ((n - 1) / (stages.length - 1)) * 82;
  const actual = stages.find((s) => s.estado === "actual")?.n ?? 1;
  return (
    <div
      className="relative h-[70px] lg:h-[84px]"
      role="img"
      aria-label={stages.map((s) => `${s.corto}: ${agentes.filter((a) => a.stage === s.n).length} agentes`).join(", ")}
    >
      {/* Camino: bastón de caramelo hasta el stage actual; nieve punteada después */}
      <div className="absolute inset-x-[9%] top-[40px] h-[8px] rounded-full bg-[rgb(255_255_255/0.16)]" />
      <div
        className="absolute left-[9%] top-[40px] h-[8px] rounded-full"
        style={{ width: `${pos(actual) - 9}%`, background: "repeating-linear-gradient(-45deg, #fff 0 7px, #e8283c 7px 14px)" }}
      />
      {stages.map((s) => {
        const grupo = agentes.filter((a) => a.stage === s.n);
        const yo = grupo.find((a) => a.yo);
        const otros = grupo.filter((a) => !a.yo);
        // Celular: 1 cabeza por stage (la tuya si estás ahí); computadora: hasta MAX_CABEZAS.
        const visibles = otros.slice(0, yo ? MAX_CABEZAS - 1 : MAX_CABEZAS);
        const resto = grupo.length - visibles.length - (yo ? 1 : 0);
        const restoCel = grupo.length - 1;
        const mas = "ml-2 rounded-full bg-[rgb(255_255_255/0.16)] px-1.5 text-[0.7rem] font-extrabold";
        const fondo = s.estado === "superado" ? "var(--verde-claro)" : s.estado === "actual" ? "var(--oro)" : "rgb(255 255 255 / 0.18)";
        return (
          <div key={s.n} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${pos(s.n)}%` }}>
            <div className="flex h-[28px] items-end -space-x-1.5">
              {visibles.map((a, i) => (
                <span key={a.alias} className={i === 0 && !yo ? "" : "hidden lg:block"}>
                  <Cabeza config={a.avatar} size={20} />
                </span>
              ))}
              {yo && (
                <span className="rounded-[4px] p-[2px]" style={{ background: "var(--rojo-boton)" }}>
                  <Cabeza config={yo.avatar} size={18} />
                </span>
              )}
              {restoCel > 0 && <span className={`${mas} lg:hidden`}>+{restoCel}</span>}
              {resto > 0 && <span className={`${mas} hidden lg:inline`}>+{resto}</span>}
            </div>
            <span
              className={`mt-[2px] grid h-[26px] w-[26px] place-items-center rounded-full text-[0.8rem] font-extrabold ${s.estado === "actual" ? "latido" : ""}`}
              style={{ background: fondo, color: s.estado === "bloqueado" ? "var(--hielo)" : "var(--tinta)", boxShadow: "inset 0 -3px 0 rgb(0 0 0 / 0.15)" }}
            >
              {s.estado === "superado" ? "✓" : s.n === 6 ? <PixelIcon name="chest" size={15} /> : s.n}
            </span>
            <span className="mt-1 hidden whitespace-nowrap text-[0.75rem] font-bold text-[var(--hielo)] lg:block">{s.corto}</span>
          </div>
        );
      })}
    </div>
  );
}

function Ranking({ agentes, puesto, yo }: { agentes: Agente[]; puesto: number; yo: Agente }) {
  return (
    <>
      {/* Celular: podio en una línea */}
      <ol className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 text-[0.8rem] font-bold lg:hidden" aria-label="Ranking">
        {agentes.slice(0, 3).map((a, i) => (
          <li key={a.alias} className="flex shrink-0 items-center gap-1.5 rounded-full bg-[rgb(255_255_255/0.1)] py-1 pl-1 pr-2.5">
            <Medalla n={i + 1} />
            {plato(a.alias)} <span className="text-[var(--oro)]">{a.puntos}</span>
          </li>
        ))}
        {puesto > 3 && (
          <li className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--rojo-boton)] py-1 pl-2.5 pr-2.5">
            Tú · #{puesto} <span className="text-[var(--oro)]">{yo.puntos}</span>
          </li>
        )}
      </ol>

      {/* Computadora: tarjeta de ranking con scroll y tu fila siempre visible */}
      <div className="clay hidden overflow-hidden !rounded-[18px] lg:block">
        <p className="flex items-center justify-between bg-[var(--verde)] px-3 py-1.5 text-[0.85rem] font-extrabold text-white">
          <span className="flex items-center gap-1.5">
            <PixelIcon name="ranking" size={15} /> Ranking
          </span>
          <span>{yo.puntos} pts</span>
        </p>
        <ol className="no-scrollbar max-h-[108px] overflow-y-auto py-1 text-[0.85rem] font-bold" aria-label="Ranking completo" tabIndex={0}>
          {agentes.map((a, i) => (
            <li
              key={a.alias}
              className={`flex items-center justify-between gap-2 px-3 py-[3px] ${a.yo ? "sticky bottom-0 top-0 bg-[#ffe3e6] text-[var(--rojo-boton)]" : ""}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                {i < 3 ? <Medalla n={i + 1} /> : <span className="w-[18px] text-center text-[0.75rem] text-[var(--tinta-suave)]">{i + 1}</span>}
                <span className="truncate">{a.yo ? `Tú · ${a.alias}` : a.alias}</span>
              </span>
              <span className="tabular-nums">{a.puntos}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function Medalla({ n }: { n: number }) {
  return (
    <span
      className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[0.65rem] font-black text-[var(--tinta)]"
      style={{ background: MEDALLA[n - 1], boxShadow: "inset 0 -2px 0 rgb(0 0 0 / 0.18)" }}
      aria-label={`Puesto ${n}`}
    >
      {n}
    </span>
  );
}
