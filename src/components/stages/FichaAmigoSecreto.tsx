"use client";

import { useState } from "react";
import { PixelIcon, type IconName } from "@/components/ui/PixelIcon";
import { masPicantes, precio, puedePagar, SOBRES_GRATIS_POR_DIA, type CasaConRespuestas, type RespuestaFicha } from "@/features/stages/ficha";
import { api } from "@/lib/cliente/api";
import type { FichaAmigo } from "@/lib/server/casas";
import { Cabeza } from "./Cabeza";
import { textoPresupuesto } from "./textosSala";

export interface DatosFicha {
  alias: string;
  avatar: unknown;
  regalos: string[];
  datos: { label: string; valor: string }[];
  /** Todo lo que tu amigo secreto respondió hasta hoy, en orden. */
  respuestas: (RespuestaFicha & { abierta?: boolean; estado?: string })[];
  /** Sobres que ya abriste antes de hoy (gratis o pagando). */
  abiertas: string[];
}

const CASAS: { n: CasaConRespuestas; titulo: string; icono: IconName }[] = [
  { n: 2, titulo: "La manada", icono: "sheep" },
  { n: 3, titulo: "Amor y relaciones", icono: "heart" },
  { n: 4, titulo: "Picante", icono: "chili" },
];

/**
 * Ficha privada del amigo secreto (solo la ve quien regala).
 *  - Durante la temporada se va llenando: cada respuesta de tu amigo aparece como un sobre
 *    cerrado. Cada día abres uno gratis; los demás cuestan monedas, y las monedas son también
 *    tu puntaje del ranking: fisgonear tiene precio.
 *  - La ficha final destaca "lo más picante" (más picor y más raro) para todos.
 * shortcut: vista de diseño; en el juego real el servidor nunca manda una respuesta cerrada.
 */
export interface FichaReal {
  final: boolean;
  gratisHoy: number;
  destacadas: string[];
  juegaPicante: boolean | null;
}

export function FichaAmigoSecreto({ f: inicial, saldoInicial, dia, real, presupuesto = 40 }: { f: DatosFicha; saldoInicial: number; dia: number; real?: FichaReal; presupuesto?: number | null }) {
  const [f, setF] = useState(inicial);
  const [r2, setR2] = useState(real);
  const [vista, setVista] = useState<"temporada" | "final">(real?.final ? "final" : "temporada");
  const [abiertas, setAbiertas] = useState(() => new Set(real ? inicial.respuestas.filter((r) => r.abierta).map((r) => r.id) : inicial.abiertas));
  const [saldo, setSaldo] = useState(saldoInicial);
  const [gratis, setGratis] = useState(real ? real.gratisHoy : SOBRES_GRATIS_POR_DIA);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const final = vista === "final";
  const idsDestacadas = r2 ? r2.destacadas : masPicantes(f.respuestas).map((r) => r.id);
  const destacadas = idsDestacadas.map((id) => f.respuestas.find((r) => r.id === id)).filter((r): r is DatosFicha["respuestas"][number] => !!r);
  const abierta = (r: RespuestaFicha) => r.respuesta === null || abiertas.has(r.id) || (final && idsDestacadas.includes(r.id));
  const cerradas = f.respuestas.filter((r) => !abierta(r)).length;
  const pasadas = f.respuestas.filter((r) => r.respuesta === null).length;

  const abrir = async (r: RespuestaFicha, pagando: boolean) => {
    if (r2) {
      // Juego real: el servidor decide si es gratis o cuánto cuesta, y devuelve la ficha nueva.
      setOcupado(true);
      setError("");
      const res = await api<{ ficha: FichaAmigo }>("/api/casas/amigo", { body: { respuesta: r.id } });
      setOcupado(false);
      setConfirmar(null);
      if (!res.ok) return setError(res.error);
      const n = res.ficha;
      setF({ ...f, respuestas: n.respuestas, regalos: n.regalos, datos: n.datos });
      setAbiertas(new Set(n.respuestas.filter((x) => x.abierta).map((x) => x.id)));
      setSaldo(n.monedas);
      setGratis(n.gratisHoy);
      setR2({ final: n.final, gratisHoy: n.gratisHoy, destacadas: n.destacadas, juegaPicante: n.juegaPicante });
      return;
    }
    if (pagando) {
      if (!puedePagar(saldo, r)) return;
      setSaldo((s) => s - precio(r));
    } else setGratis((g) => g - 1);
    setAbiertas((a) => new Set(a).add(r.id));
    setConfirmar(null);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {!r2 && (
      <div className="clay flex gap-1 !rounded-[16px] p-1" role="tablist" aria-label="Momento de la ficha">
        {(
          [
            ["temporada", `Durante la temporada · día ${dia}`],
            ["final", "Ficha final · 20 dic"],
          ] as const
        ).map(([id, txt]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={vista === id}
            onClick={() => setVista(id)}
            className="min-h-11 flex-1 rounded-[12px] px-2 text-[0.88rem] font-extrabold transition-colors"
            style={vista === id ? { background: "var(--verde)", color: "#fff" } : { color: "var(--tinta-suave)" }}
          >
            {txt}
          </button>
        ))}
      </div>
      )}

      <article className="clay relative overflow-hidden">
        {/* Cabecera tipo sobre: papel rojo con lunares y sello */}
        <header className="relative flex flex-col items-center px-6 pb-8 pt-9 text-center text-white" style={{ background: "radial-gradient(circle, rgb(255 255 255 / 0.18) 5px, transparent 6px) 0 0 / 30px 30px, radial-gradient(circle, rgb(255 255 255 / 0.18) 5px, transparent 6px) 15px 15px / 30px 30px, #c8102e" }}>
          <span className="absolute right-4 top-4 rotate-6 rounded-full border-[3px] border-white/85 px-3 py-1 text-[0.72rem] font-black uppercase tracking-wider">Privada y confidencial</span>
          <Cabeza config={f.avatar} size={46} bola />
          <p className="mt-3 text-[0.95rem] font-bold text-white/90">Tu amigo secreto es</p>
          <h1 className="f-titulo text-[2.3rem] font-semibold leading-tight">{f.alias}</h1>
          <p className="mt-1 rounded-full bg-black/20 px-3 py-1 text-[0.9rem] font-semibold">El 24 dic dirás: &quot;mi regalo es para {f.alias}&quot;</p>
        </header>

        {/* Saldo: el mismo número que el ranking */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-[#eee6f3] bg-[var(--papel)] px-6 py-3 sm:px-8">
          <p className="flex items-center gap-1.5 text-[1.05rem] font-extrabold" aria-live="polite">
            <PixelIcon name="coin" size={20} /> Tienes {saldo} monedas
          </p>
          <p className="text-[0.85rem] font-bold text-[var(--tinta-suave)]">
            {gratis > 0 ? `Hoy te queda ${gratis} sobre gratis` : "Sobre gratis de hoy: usado"} · {cerradas} cerrados
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:p-8">
          {final && (
            <section className="rounded-[20px] bg-[#fff1d6] p-4 shadow-[0_0_0_2px_#f5d9a3]">
              <h2 className="f-titulo flex items-center gap-2 text-[1.4rem] font-semibold">
                <PixelIcon name="chili" size={24} /> Lo más picante
              </h2>
              <p className="mt-0.5 text-[0.88rem] text-[var(--tinta-suave)]">Se abre gratis el último día: sus respuestas más atrevidas y las que casi nadie dio.</p>
              <ol className="mt-3 flex flex-col gap-2.5">
                {destacadas.map((r, i) => (
                  <li key={r.id} className="flex items-start gap-3 rounded-[16px] bg-white px-3.5 py-3 shadow-[0_0_0_2px_#f5d9a3]">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--rojo-boton)] text-[0.9rem] font-black text-white">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[0.9rem] text-[var(--tinta-suave)]">{r.pregunta}</p>
                      <p className="f-titulo text-[1.3rem] font-semibold text-[var(--rojo-boton)]">{r.respuesta}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.78rem] font-bold text-[var(--tinta-suave)]">
                        <span className="flex items-center gap-0.5" aria-label={`Picor ${r.picor} de 3`}>
                          {Array.from({ length: r.picor }, (_, k) => (
                            <PixelIcon key={k} name="chili" size={12} />
                          ))}
                        </span>
                        {r.igualQue !== undefined && r.igualQue < 0.35 && <span>Solo el {Math.round(r.igualQue * 100)} % respondió lo mismo</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Seccion icono="chest" titulo="Quiere uno de estos" nota={`Gratis desde el sorteo, para que te dé tiempo de comprar. Presupuesto: ${textoPresupuesto(presupuesto)}.`}>
            <ol className="grid gap-2.5 sm:grid-cols-2">
              {f.regalos.map((r, i) => (
                <li key={r} className="flex items-center gap-3 rounded-[16px] bg-white px-3.5 py-3 font-bold shadow-[0_0_0_2px_#eee6f3]">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--rojo-boton)] text-[0.85rem] font-black text-white">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ol>
          </Seccion>

          <Seccion icono="friend" titulo="Así lo reconoces">
            <dl className="flex flex-wrap gap-2">
              {f.datos.map((d) => (
                <div key={d.label} className="rounded-full bg-[#e8f6ee] px-3.5 py-1.5 text-[0.92rem]">
                  <dt className="inline font-semibold text-[var(--tinta-suave)]">{d.label}: </dt>
                  <dd className="inline font-extrabold text-[var(--verde)]">{d.valor}</dd>
                </div>
              ))}
            </dl>
          </Seccion>

          <p className="-mb-2 text-[0.92rem] font-semibold text-[var(--tinta-suave)]">
            Ha respondido {f.respuestas.length} preguntas{pasadas ? ` (pasó ${pasadas})` : ""}. Cada respuesta nueva llega como un sobre cerrado.
          </p>

          {CASAS.map((c) => {
            const items = f.respuestas.filter((r) => r.casa === c.n);
            if (c.n === 4 && r2?.juegaPicante === false)
              return (
                <Seccion key={c.n} icono={c.icono} titulo={c.titulo}>
                  <p className="rounded-[16px] bg-[#f3eef7] px-3.5 py-2.5 font-bold text-[var(--tinta-suave)]">No juega Picante.</p>
                </Seccion>
              );
            if (!items.length) return null;
            return (
              <Seccion key={c.n} icono={c.icono} titulo={c.titulo}>
                <ul className="flex flex-col gap-2">
                  {items.map((r) => (
                    <Sobre
                      key={r.id}
                      r={r}
                      abierta={abierta(r)}
                      destacada={final && idsDestacadas.includes(r.id)}
                      gratis={gratis > 0}
                      saldo={saldo}
                      confirmando={confirmar === r.id}
                      onPedir={() => setConfirmar(r.id)}
                      onCancelar={() => setConfirmar(null)}
                      onAbrir={(pagando) => void abrir(r, pagando)}
                    />
                  ))}
                </ul>
              </Seccion>
            );
          })}

          {error && (
            <p className="error text-center" role="alert">
              {error}
            </p>
          )}
          {ocupado && <p className="text-center text-[0.9rem] font-bold text-[var(--tinta-suave)]">Abriendo el sobre…</p>}
          <p className="rounded-[16px] bg-[#fff1d6] px-4 py-3 text-center text-[0.95rem] font-semibold text-[var(--tinta)]">
            {final ? "Puedes seguir abriendo sobres hasta el intercambio. " : ""}Privada y confidencial. Guárdala para describir y reír el día del intercambio.
          </p>
        </div>
      </article>
    </div>
  );
}

function Sobre({
  r,
  abierta,
  destacada,
  gratis,
  saldo,
  confirmando,
  onPedir,
  onCancelar,
  onAbrir,
}: {
  r: RespuestaFicha;
  abierta: boolean;
  destacada: boolean;
  gratis: boolean;
  saldo: number;
  confirmando: boolean;
  onPedir: () => void;
  onCancelar: () => void;
  onAbrir: (pagando: boolean) => void;
}) {
  const costo = precio(r);
  const alcanza = saldo >= costo;
  return (
    <li className={`rounded-[16px] px-3.5 py-2.5 ${abierta ? "bg-white shadow-[0_0_0_2px_#eee6f3]" : "border-2 border-dashed border-[#ddd3e8] bg-[#f6f1fa]"}`}>
      <p className="text-[0.9rem] text-[var(--tinta-suave)]">{r.pregunta}</p>
      {abierta ? (
        r.respuesta === null ? (
          <p className="mt-0.5 text-[0.95rem] font-extrabold italic text-[var(--tinta-suave)]">{(r as { estado?: string }).estado === "vencida" ? "No respondió a tiempo" : "Pasó"}</p>
        ) : (
          <p className="f-titulo mt-0.5 flex flex-wrap items-center gap-2 text-[1.2rem] font-semibold text-[var(--rojo-boton)]">
            {r.respuesta}
            {destacada && <span className="pastilla !py-0 !text-[0.7rem]">Lo más picante</span>}
          </p>
        )
      ) : confirmando ? (
        <div className="mt-2 rounded-[12px] bg-[#fff1d6] p-3" role="alertdialog" aria-label="Confirmar fisgoneo">
          <p className="text-[0.88rem]">
            Gastas <b>{costo} monedas</b> y bajas de {saldo} a {saldo - costo}. Las monedas también son tu puntaje del ranking.
          </p>
          <div className="mt-2 flex gap-2">
            <button type="button" className="boton !min-h-11 flex-1 !text-[0.95rem]" onClick={() => onAbrir(true)}>
              Sí, fisgonear
            </button>
            <button type="button" className="boton claro !min-h-11 flex-1 !text-[0.95rem]" onClick={onCancelar}>
              Mejor no
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          <span className="select-none text-[1.1rem] font-black tracking-[0.3em] text-[#c9c2d6]" aria-label="Respuesta cerrada">
            • • • •
          </span>
          {gratis ? (
            <button type="button" className="boton verde !min-h-11 !px-4 !text-[0.9rem]" onClick={() => onAbrir(false)}>
              Abrir gratis
            </button>
          ) : (
            <button type="button" className="boton oro !min-h-11 !px-4 !text-[0.9rem]" disabled={!alcanza} onClick={onPedir}>
              <PixelIcon name="coin" size={14} /> {alcanza ? `Fisgonear · ${costo}` : `Te faltan ${costo - saldo}`}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function Seccion({ icono, titulo, nota, children }: { icono: IconName; titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="f-titulo mb-2.5 flex items-center gap-2 text-[1.3rem] font-semibold">
        <PixelIcon name={icono} size={22} /> {titulo}
      </h2>
      {nota && <p className="-mt-1.5 mb-2.5 text-[0.85rem] text-[var(--tinta-suave)]">{nota}</p>}
      {children}
    </section>
  );
}
