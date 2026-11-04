"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CALENDARIO, ULTIMO_DIA, YO } from "@/lib/sim/contenido";
import { avanzarDia, cumpliMision, irAlDia, ranking, reiniciar, totales, useSim, type SimState } from "@/lib/sim/store";
import { MODULES } from "@/lib/modules";
import { JUEGOS, TARJETA_A_JUEGO, estaHecho, tuDia, type Tarea } from "./registro";
import { PixelIcon } from "@/components/ui/PixelIcon";

const NOMBRE_DIA = (d: number) => (d === 0 ? "Pretemporada" : d === ULTIMO_DIA ? "Gran final" : `Día ${d} de ${ULTIMO_DIA - 1}`);

export function Simulador() {
  const s = useSim();
  const params = useSearchParams();
  const [abierto, setAbierto] = useState<string | null>(null);
  const [ayuda, setAyuda] = useState(false);

  // ?juego=foto abre directamente un juego (desde las tarjetas de las zonas)
  useEffect(() => {
    const j = params.get("juego");
    if (j) {
      const id = TARJETA_A_JUEGO[j] ?? j;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (JUEGOS[id]) setAbierto(id);
    }
  }, [params]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  if (!s) return <p className="p-6 font-pixel text-[var(--on-sky)]">Preparando el modo prueba…</p>;

  const tareas = tuDia(s);
  const principales = tareas.filter((t) => t.tipo !== "extra");
  const extras = tareas.filter((t) => t.tipo === "extra");
  const hechas = principales.filter((t) => estaHecho(s, t.id)).length;
  const mis = totales(s)[YO];
  const puesto = ranking(s).findIndex((r) => r.pid === YO) + 1;

  const siguiente = () => {
    const mision = CALENDARIO[s.day];
    if (s.day >= 1 && s.day < ULTIMO_DIA && !cumpliMision(s, s.day) && !confirm(`Aún no cumpliste la misión de hoy (${JUEGOS[mision]?.titulo}). ¿Pasar al siguiente día igual?`)) return;
    avanzarDia();
    setAbierto(null);
  };

  return (
    <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-40 pt-4">
      {/* ------------------------------------------------ barra de control */}
      <div className="px-box sticky top-2 z-30 flex flex-col gap-2 px-3 py-2.5" style={{ ["--bg" as string]: "var(--night)", color: "var(--cream)" }}>
        <div className="flex items-center justify-between gap-2">
          <span className="px-chip" style={{ ["--chip" as string]: "var(--gold)", color: "var(--ink)" }}>
            🧪 MODO PRUEBA
          </span>
          <span className="flex items-center gap-1 font-pixel text-[0.9rem]">
            <PixelIcon name="coin" size={16} /> {mis} · puesto #{puesto}
          </span>
        </div>
        <span className="font-pixel text-[1.3rem] leading-tight">{NOMBRE_DIA(s.day)}</span>
        <div className="flex items-center gap-2">
          <span className="flex w-full gap-2">
            <select
              aria-label="Saltar a un día"
              className="px-chip flex-1 !text-[0.78rem]"
              value=""
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n > s.day && confirm(`¿Saltar al día ${n}? Los bots jugarán los días intermedios y tú no.`)) irAlDia(n);
                setAbierto(null);
              }}
            >
              <option value="">Saltar a…</option>
              {Array.from({ length: ULTIMO_DIA - s.day }, (_, i) => s.day + i + 1).map((d) => (
                <option key={d} value={d}>
                  {d === ULTIMO_DIA ? "Gran final" : `Día ${d}`}
                </option>
              ))}
            </select>
            <button type="button" className="px-chip flex-1 justify-center !text-[0.78rem]" style={{ ["--chip" as string]: "var(--mint)", color: "var(--ink)" }} onClick={siguiente} disabled={s.day >= ULTIMO_DIA}>
              Siguiente día ▶
            </button>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------ explicación */}
      <div className="px-box p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-pixel text-[1.6rem] leading-tight">Prueba toda la temporada</h1>
            <p className="mt-1 text-[0.92rem] text-[var(--ink-soft)]">
              Juegas tú contra 8 agentes bot. Todo está desbloqueado y nada toca los datos reales: se guarda solo en este navegador.
            </p>
          </div>
          <button type="button" className="px-chip shrink-0" onClick={() => setAyuda((a) => !a)}>
            {ayuda ? "Ocultar" : "¿Cómo?"}
          </button>
        </div>
        {ayuda && (
          <ol className="mt-3 flex list-decimal flex-col gap-1 pl-5 text-[0.9rem]">
            <li>
              Mira <b>«Tu día»</b>: es exactamente lo que verá cada amigo ese día.
            </li>
            <li>Toca cada tarea para jugarla. Cada juego explica sus reglas arriba.</li>
            <li>
              Toca <b>«Siguiente día ▶»</b>: los bots juegan, se cierran votaciones y apuestas, y cambia la misión.
            </li>
            <li>
              En <b>«Todos los juegos»</b> puedes probar cualquiera en cualquier momento. Usa <b>↺ Volver a jugar</b> para repetir.
            </li>
            <li>Cuando quieras empezar de cero, toca «Reiniciar prueba» abajo del todo.</li>
          </ol>
        )}
      </div>

      {/* ------------------------------------------------ tu día */}
      <section className="px-box p-4" aria-labelledby="tu-dia">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="tu-dia" className="font-pixel text-[1.35rem]">
            ⭐ Tu día
          </h2>
          <span className="px-chip" style={{ ["--chip" as string]: hechas === principales.length ? "var(--mint)" : "var(--cream-2)" }}>
            {hechas}/{principales.length} listo
          </span>
        </div>
        <p className="px-hint mb-2">{s.day === 0 ? "Antes de empezar: prepara tu agente y descubre a quién le regalas." : s.day === ULTIMO_DIA ? "Hoy es la entrega de regalos." : "Menos de 2 minutos. Después, si quieres, los extras."}</p>
        <ul className="flex flex-col gap-1.5">
          {principales.map((t) => (
            <FilaTarea key={t.id} s={s} t={t} onAbrir={setAbierto} />
          ))}
        </ul>
        {extras.length > 0 && (
          <>
            <p className="font-pixel mb-1 mt-3 text-[0.95rem]">Extras opcionales</p>
            <ul className="grid grid-cols-2 gap-1.5">
              {extras.map((t) => (
                <FilaTarea key={t.id} s={s} t={t} onAbrir={setAbierto} compacta />
              ))}
            </ul>
          </>
        )}
      </section>

      {/* ------------------------------------------------ ranking corto */}
      <section className="px-box p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-pixel text-[1.2rem]">🏆 Ranking</h2>
          <button type="button" className="px-chip" onClick={() => setAbierto("ranking")}>
            Ver todo
          </button>
        </div>
        <ol className="flex flex-col gap-1">
          {ranking(s)
            .slice(0, 5)
            .map((r, i) => (
              <li key={r.pid} className="flex items-center gap-2 text-[0.95rem]" style={{ fontWeight: r.pid === YO ? 700 : 400 }}>
                <span className="w-6 font-pixel">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
                <span>{r.avatar}</span>
                <span className="flex-1">{r.codename}{r.pid === YO ? " (tú)" : ""}</span>
                <span className="font-pixel tabular-nums">{r.points}</span>
              </li>
            ))}
        </ol>
        {s.feed.length > 0 && <p className="px-hint mt-2">📰 {s.feed[s.feed.length - 1].text}</p>}
      </section>

      {/* ------------------------------------------------ todos los juegos */}
      <section className="px-box p-4">
        <h2 className="font-pixel mb-2 text-[1.2rem]">🗺️ Todos los juegos (por zona)</h2>
        <div className="flex flex-col gap-3">
          {MODULES.map((m, i) => (
            <div key={m.id}>
              <p className="font-pixel text-[0.95rem]">
                {m.icon} Zona {i + 1} · {m.title}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {m.cards.map((c) => {
                  const id = TARJETA_A_JUEGO[c.id];
                  const j = JUEGOS[id];
                  if (!j) return null;
                  return (
                    <button key={c.id} type="button" className="px-chip" style={{ ["--chip" as string]: estaHecho(s, id) ? "var(--mint)" : "#fff" }} onClick={() => setAbierto(id)}>
                      {j.emoji} {c.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/" className="px-chip">
          ← Volver a la aldea
        </Link>
        <button
          type="button"
          className="px-chip"
          style={{ ["--chip" as string]: "#ffd6dc" }}
          onClick={() => {
            if (confirm("¿Reiniciar toda la prueba? Se borran tus puntos y partidas de prueba.")) {
              reiniciar();
              setAbierto(null);
            }
          }}
        >
          ↺ Reiniciar prueba
        </button>
      </div>

      {abierto && JUEGOS[abierto] && <Ventana s={s} id={abierto} onCerrar={() => setAbierto(null)} />}
    </div>
  );
}

function FilaTarea({ s, t, onAbrir, compacta }: { s: SimState; t: Tarea; onAbrir: (id: string) => void; compacta?: boolean }) {
  const j = JUEGOS[t.id];
  if (!j) return null;
  const ok = estaHecho(s, t.id);
  return (
    <li>
      <button
        type="button"
        onClick={() => onAbrir(t.id)}
        className="px-box flex w-full items-center gap-2 px-3 py-2 text-left"
        style={{ ["--bg" as string]: ok ? "var(--mint)" : t.tipo === "principal" ? "#fff" : "var(--cream-2)", margin: "3px 0" }}
      >
        <span className="text-xl" aria-hidden>
          {ok ? "✅" : j.emoji}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className={`block font-pixel ${compacta ? "text-[0.85rem]" : "text-[1rem]"}`}>{j.titulo}</span>
          {t.nota && !compacta && <span className="block text-[0.75rem] text-[var(--ink-soft)]">{t.nota}</span>}
        </span>
        {!compacta && <span className="font-pixel text-[var(--ink-soft)]">{ok ? "Hecho" : "Jugar ›"}</span>}
      </button>
    </li>
  );
}

function Ventana({ s, id, onCerrar }: { s: SimState; id: string; onCerrar: () => void }) {
  const { C } = JUEGOS[id];
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgb(27_31_74/0.6)] px-3 pb-32 pt-4" onClick={onCerrar} role="dialog" aria-modal="true">
      <div className="px-box anim-pop mx-auto max-w-md p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <span className="px-chip" style={{ ["--chip" as string]: "var(--gold)" }}>
            🧪 {NOMBRE_DIA(s.day)}
          </span>
          <button type="button" className="px-chip" onClick={onCerrar} aria-label="Cerrar">
            ✕ Cerrar
          </button>
        </div>
        <C s={s} />
      </div>
    </div>
  );
}
