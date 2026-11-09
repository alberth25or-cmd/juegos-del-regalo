import { PixelIcon } from "@/components/ui/PixelIcon";
import {
  costoFisgonearTodoElDia,
  DIA_TIPICO,
  FISGONEAR,
  GANANCIAS,
  gananciaDiaria,
  MULTIPLICADOR_SIN_PASES,
  PASAR,
  PASES_POR_CASA,
  POR_DIA,
  VENCIDA_SIN_PASO,
} from "@/features/scoring/economia";

/**
 * Sistema de precios a la vista del organizador (y de quien quiera revisarlo). Todo sale de
 * `economia.ts`, así esta tabla nunca se desfasa de lo que cobra el servidor.
 */
export function TablaPrecios() {
  const tipico = gananciaDiaria(DIA_TIPICO);
  const gana: [string, string][] = [
    ["Minijuegos (mejor partida del día)", `hasta ${GANANCIAS.minijuegoDia} c/u · ${GANANCIAS.minijuegosPorDia} juegos`],
    ["La manada", `${GANANCIAS.manadaResponder} + ${GANANCIAS.manadaCoincidir} si coincides`],
    ["Amor", `${GANANCIAS.amor} por pregunta · ${POR_DIA[3]} al día`],
    ["Picante", `${GANANCIAS.picante} por pregunta · ${POR_DIA[4]} al día`],
    ["Juicio final", `${GANANCIAS.juicio} por reto`],
    ["Votar en el Tablón", `${GANANCIAS.voto}`],
    ["Bono: al día en todas las casas", `${GANANCIAS.bonoAlDia}`],
  ];
  const cuesta: [string, string][] = [
    ["Fisgonear un sobre de La manada", `${FISGONEAR[2]}`],
    ["Fisgonear un sobre de Amor", `${FISGONEAR[3]}`],
    ["Fisgonear un sobre de Picante", `${FISGONEAR[4]}`],
    ["Pasar en Amor", `${PASAR[3]} · ${PASES_POR_CASA} pases`],
    ["Pasar en Picante", `${PASAR[4]} · ${PASES_POR_CASA} pases`],
    ["Dejar vencer (Amor/Picante)", `como pasar; sin pases ×${MULTIPLICADOR_SIN_PASES}`],
    ["Dejar vencer (Manada/Juicio)", `${VENCIDA_SIN_PASO[2]}`],
  ];
  return (
    <section className="clay mx-auto mt-6 max-w-5xl p-6" aria-labelledby="precios-t">
      <h2 id="precios-t" className="f-titulo flex items-center gap-2 text-[1.5rem] font-semibold">
        <PixelIcon name="coin" size={22} /> Precios y recompensas
      </h2>
      <p className="ayuda mt-1">Una sola moneda para todo: lo que tienes es tu puesto en el ranking. Gastar en fisgonear o pasar te baja.</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Tabla titulo="Se gana" filas={gana} color="var(--verde)" signo="+" />
        <Tabla titulo="Cuesta" filas={cuesta} color="var(--rojo-boton)" signo="−" />
      </div>
      <p className="mt-4 rounded-[14px] bg-[#f3eef7] px-4 py-3 text-[0.9rem]">
        <b>Equilibrio:</b> un día típico da unas <b>{tipico} monedas</b>. Abrir todos los sobres nuevos de un día costaría {costoFisgonearTodoElDia()}: alcanza para
        fisgonear 2 o 3 al día, nunca para todo. Pasar siempre cuesta más de lo que da responder.
      </p>
    </section>
  );
}

function Tabla({ titulo, filas, color, signo }: { titulo: string; filas: [string, string][]; color: string; signo: string }) {
  return (
    <div>
      <h3 className="mb-2 text-[0.85rem] font-extrabold uppercase tracking-[0.1em]" style={{ color }}>
        {titulo}
      </h3>
      <table className="w-full text-[0.9rem]">
        <tbody>
          {filas.map(([que, cuanto]) => (
            <tr key={que} className="border-b border-[#eee6f3]">
              <th scope="row" className="py-1.5 pr-3 text-left font-semibold">
                {que}
              </th>
              <td className="py-1.5 text-right font-extrabold tabular-nums" style={{ color }}>
                {/^\d/.test(cuanto) ? signo : ""}
                {cuanto}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
