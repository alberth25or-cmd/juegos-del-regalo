"use client";

import { useEffect, useState } from "react";

export interface YoAgente {
  codename: string;
  avatar: string;
  role: "organizer" | "player";
  status: "pending" | "approved" | "rejected";
  groupName: string;
  points: number;
  rank: number | null;
  agentes: number;
}

export type Yo = { cargando: true; agente?: undefined } | { cargando: false; agente: YoAgente | null };

/** Agente de esta sesión (lo pide al servidor y se refresca al volver a la pestaña). */
export function useYo(): Yo {
  const [yo, setYo] = useState<Yo>({ cargando: true });
  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      try {
        const r = await fetch("/api/yo", { cache: "no-store" });
        const data = await r.json();
        if (vivo) setYo({ cargando: false, agente: data.agente ?? null });
      } catch {
        if (vivo) setYo({ cargando: false, agente: null });
      }
    };
    cargar();
    const onVis = () => document.visibilityState === "visible" && cargar();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      vivo = false;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return yo;
}
