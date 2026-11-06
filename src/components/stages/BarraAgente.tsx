import { PixelIcon } from "@/components/ui/PixelIcon";
import { Cabeza } from "./Cabeza";
import type { Agente, Stage } from "./datosEjemplo";

const MAX_CABEZAS = 3;

/** Barra superior fija de las pantallas de juego: quién eres, cómo vas, dónde va cada agente y el ranking. */
export function BarraAgente({ yo, puesto, agentes, stages }: { yo: Agente; puesto: number; agentes: Agente[]; stages: Stage[] }) {
  const total = agentes.length;
  return (
    <header className="sticky top-0 z-30 border-b-[4px] border-[var(--gold)] bg-[var(--noche-2)]/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-2 px-4 pb-2 pt-3 lg:grid-cols-[230px_1fr_300px] lg:items-center lg:px-7 lg:py-3">
        {/* Quién eres */}
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <div className="flex items-center gap-2.5">
            <Cabeza config={yo.avatar} size={34} yo title="Tu cabeza" />
            <div>
              <p className="font-pixel text-[0.95rem] leading-tight">{yo.alias}</p>
              <p className="hidden text-[0.8rem] text-[var(--texto-suave)] lg:block">
                Puesto #{puesto} de {total}
              </p>
            </div>
          </div>
          <p className="px-chip lg:hidden" style={{ ["--chip" as string]: "var(--noche)", color: "var(--gold)" }} aria-label={`${yo.puntos} puntos, puesto ${puesto} de ${total}`}>
            <PixelIcon name="coin" size={14} /> {yo.puntos} · #{puesto}
          </p>
        </div>

        {/* Riel de stages con las cabezas */}
        <Riel agentes={agentes} stages={stages} />

        {/* Ranking: top 3 + tú en celular; lista completa con scroll en computadora */}
        <Ranking agentes={agentes} puesto={puesto} yo={yo} />
      </div>
    </header>
  );
}

function Riel({ agentes, stages }: { agentes: Agente[]; stages: Stage[] }) {
  const pos = (n: number) => 9 + ((n - 1) / (stages.length - 1)) * 82;
  const actual = stages.find((s) => s.estado === "actual")?.n ?? 1;
  return (
    <div className="relative h-[62px] lg:h-[72px]" role="img" aria-label={stages.map((s) => `${s.corto}: ${agentes.filter((a) => a.stage === s.n).length} agentes`).join(", ")}>
      <div className="absolute inset-x-[9%] top-[36px] h-[5px] bg-[var(--linea)]" />
      <div className="absolute left-[9%] top-[36px] h-[5px] bg-[var(--gold)]" style={{ width: `${pos(actual) - 9}%` }} />
      {stages.map((s) => {
        const grupo = agentes.filter((a) => a.stage === s.n);
        const yo = grupo.find((a) => a.yo);
        const otros = grupo.filter((a) => !a.yo);
        // Celular: 1 cabeza por stage (la tuya si estás ahí); computadora: hasta MAX_CABEZAS.
        const visibles = otros.slice(0, yo ? MAX_CABEZAS - 1 : MAX_CABEZAS);
        const resto = grupo.length - visibles.length - (yo ? 1 : 0);
        const restoCel = grupo.length - 1;
        const abierto = s.estado !== "bloqueado";
        const mas = "ml-2.5 font-pixel text-[0.7rem] text-[var(--texto-suave)]";
        return (
          <div key={s.n} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${pos(s.n)}%` }}>
            <div className="flex h-[30px] items-end -space-x-2">
              {visibles.map((a, i) => (
                <span key={a.alias} className={i === 0 && !yo ? "" : "hidden lg:block"}>
                  <Cabeza config={a.avatar} size={20} />
                </span>
              ))}
              {yo && <Cabeza config={yo.avatar} size={20} yo />}
              {restoCel > 0 && <span className={`${mas} lg:hidden`}>+{restoCel}</span>}
              {resto > 0 && <span className={`${mas} hidden lg:inline`}>+{resto}</span>}
            </div>
            <span
              className="mt-[1px] grid h-[22px] w-[22px] place-items-center font-pixel text-[0.72rem]"
              style={{
                background: "var(--noche-2)",
                boxShadow: `0 0 0 3px ${abierto ? "var(--gold)" : "var(--linea)"}`,
                color: abierto ? "var(--gold)" : "var(--texto-tenue)",
              }}
            >
              {s.n === 6 ? <PixelIcon name="chest" size={14} /> : s.n}
            </span>
            <span className="mt-1 hidden whitespace-nowrap text-[0.72rem] text-[var(--texto-tenue)] lg:block">{s.corto}</span>
          </div>
        );
      })}
    </div>
  );
}

function Ranking({ agentes, puesto, yo }: { agentes: Agente[]; puesto: number; yo: Agente }) {
  const fila = (a: Agente, i: number) => (
    <li
      key={a.alias}
      className={`flex justify-between gap-2 px-2 py-[3px] ${a.yo ? "sticky bottom-0 top-0" : ""}`}
      style={a.yo ? { color: "var(--yo)", background: "linear-gradient(rgb(255 138 153 / 0.14), rgb(255 138 153 / 0.14)), var(--noche)" } : undefined}
    >
      <span className="truncate">
        <span className="inline-block w-7 text-[var(--texto-tenue)]">#{i + 1}</span>
        {a.yo ? `Tú (${a.alias.replace("Agente_", "")})` : a.alias}
      </span>
      <span className="text-[var(--gold)]">{a.puntos}</span>
    </li>
  );
  return (
    <>
      {/* Celular */}
      <ol className="flex gap-1.5 overflow-x-auto pb-1 font-pixel text-[0.72rem] lg:hidden" aria-label="Ranking">
        {agentes.slice(0, 3).map((a, i) => (
          <li key={a.alias} className="whitespace-nowrap bg-[var(--noche)] px-2 py-1">
            <span className="text-[var(--gold)]">#{i + 1}</span> {a.alias.replace("Agente_", "")} {a.puntos}
          </li>
        ))}
        {puesto > 3 && (
          <li className="whitespace-nowrap bg-[var(--noche)] px-2 py-1 text-[var(--yo)]">
            #{puesto} Tú {yo.puntos}
          </li>
        )}
      </ol>
      {/* Computadora */}
      <div className="px-panel hidden lg:block" style={{ ["--bg" as string]: "var(--noche)", ["--bc" as string]: "var(--gold)" }}>
        <p className="flex items-center justify-between px-2 pt-1.5 font-pixel text-[0.78rem] text-[var(--texto-suave)]">
          <span className="flex items-center gap-1.5"><PixelIcon name="ranking" size={14} /> Ranking</span>
          <span className="text-[var(--gold)]">{yo.puntos} pts</span>
        </p>
        <ol className="no-scrollbar max-h-[104px] overflow-y-auto py-1 font-pixel text-[0.78rem]" aria-label="Ranking completo" tabIndex={0}>
          {agentes.map(fila)}
        </ol>
      </div>
    </>
  );
}
