"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/cliente/api";

export interface NoticiaVista {
  id: string;
  tipo: string;
  payload: Record<string, unknown>;
  fecha: string;
}

function texto(n: NoticiaVista) {
  const nombre = String(n.payload.nombre ?? "Alguien");
  switch (n.tipo) {
    case "temporada_creada":
      return { e: "🎄", t: `Se fundó Snowville: «${String(n.payload.nombre ?? "")}». Santa ya pidió un préstamo.` };
    case "jugador_aprobado":
      return { e: "🧑‍🎄", t: `${nombre} firmó contrato con la fábrica. Sin seguro médico, como todos.` };
    case "equipos_sorteados":
      return { e: "🎲", t: "Se sortearon los equipos. Las alianzas empiezan… y las traiciones también." };
    case "record_personal": {
      const juego = { memory: "Memory Gifts", trivia: "el Juicio del Polo Norte" }[String(n.payload.juego ?? "")] ?? "Gift Catcher";
      return { e: "🏆", t: `${nombre} rompió su récord en ${juego}: ${String(n.payload.puntaje ?? "")} pts.` };
    }
    case "casas_abiertas":
      return { e: "🏘️", t: `¡Empezó el juego! ${String(n.payload.agentes ?? "")} agentes, sorteo hecho y todas las casas abiertas.` };
    case "energia_hito":
      return { e: "🎄", t: `${String(n.payload.hito ?? "")} % de energía: ${String(n.payload.mensaje ?? "")}` };
    default:
      return { e: "📰", t: "Algo pasó en Snowville. El Auditor lo está investigando." };
  }
}

function hace(iso: string, ahora: number) {
  const s = Math.max(0, Math.round((ahora - new Date(iso).getTime()) / 1000));
  if (s < 60) return "hace un momento";
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return `hace ${Math.round(s / 86400)} d`;
}

/** Noticias del pueblo; se actualizan cada 20 s mientras la pestaña está visible. */
export function Noticias({ iniciales, ahora: ahoraServidor }: { iniciales: NoticiaVista[]; ahora: number }) {
  const [lista, setLista] = useState(iniciales);
  const [ahora, setAhora] = useState(ahoraServidor);
  useEffect(() => {
    let vivo = true;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const r = await api<{ noticias: NoticiaVista[] }>("/api/plaza", { intentos: 1, tope: 8000 });
      if (vivo && r.ok) setLista(r.noticias);
      if (vivo) setAhora(Date.now());
    };
    const t = window.setInterval(tick, 20_000);
    return () => {
      vivo = false;
      window.clearInterval(t);
    };
  }, []);

  if (lista.length === 0) return <p className="px-hint">Todavía no pasa nada en Snowville. Sospechoso.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {lista.map((n) => {
        const { e, t } = texto(n);
        return (
          <li key={n.id} className="flex items-start gap-2 text-[0.88rem] leading-snug">
            <span aria-hidden className="text-lg leading-none">
              {e}
            </span>
            <span className="min-w-0 flex-1">
              {t} <span className="whitespace-nowrap text-[0.72rem] text-[var(--ink-soft)]">· {hace(n.fecha, ahora)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
