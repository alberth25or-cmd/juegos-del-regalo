"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { computeAtmosphere, limaMinuteNow, parseHHMM, type Atmosphere } from "@/lib/atmosphere";

interface Ctx {
  atmosphere: Atmosphere;
  /** null = hora real de Lima */
  override: number | null;
  setOverride: (m: number | null) => void;
  cycling: boolean;
  setCycling: (v: boolean) => void;
}

const AtmosphereContext = createContext<Ctx | null>(null);

export function useAtmosphere() {
  const ctx = useContext(AtmosphereContext);
  if (!ctx) throw new Error("useAtmosphere fuera de AtmosphereProvider");
  return ctx;
}

// Reloj de Lima como store externo: evita desajustes de hidratación
// (el servidor siempre pinta el mediodía y el cliente corrige al instante).
function subscribeClock(cb: () => void) {
  const id = window.setInterval(cb, 20_000);
  document.addEventListener("visibilitychange", cb);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", cb);
  };
}
const clockSnapshot = () => Math.floor(limaMinuteNow());
const clockServer = () => 720;

function apply(atm: Atmosphere) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(atm.vars)) root.style.setProperty(k, v);
  root.dataset.phase = atm.phase;
  root.dataset.night = atm.isNight ? "1" : "0";
}

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverrideState] = useState<number | null>(null);
  const [cycling, setCycling] = useState(false);
  const [cycleMinute, setCycleMinute] = useState(0);
  const cycleRef = useRef<number>(0);
  const clock = useSyncExternalStore(subscribeClock, clockSnapshot, clockServer);

  // ?hora=18:30 fija la hora (para probar); ?ciclo=1 recorre el día en 60 s.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const h = parseHHMM(p.get("hora"));
    // Lectura única de la URL al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (h !== null) setOverrideState(h);
    if (p.get("ciclo") === "1") setCycling(true);
  }, []);

  // Modo demo: un día completo en 60 segundos.
  useEffect(() => {
    if (!cycling) return;
    let last = performance.now();
    let m = override ?? limaMinuteNow();
    const loop = (now: number) => {
      m = (m + ((now - last) / 60_000) * 1440) % 1440;
      last = now;
      setCycleMinute(m);
      cycleRef.current = requestAnimationFrame(loop);
    };
    cycleRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(cycleRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycling]);

  const effective = cycling ? cycleMinute : override ?? clock;
  const atmosphere = useMemo(() => computeAtmosphere(effective), [effective]);

  useEffect(() => {
    apply(atmosphere);
  }, [atmosphere]);

  useEffect(() => {
    document.documentElement.dataset.cycling = cycling ? "1" : "0";
  }, [cycling]);

  const setOverride = useCallback((m: number | null) => {
    setCycling(false);
    setOverrideState(m);
  }, []);

  return (
    <AtmosphereContext.Provider value={{ atmosphere, override, setOverride, cycling, setCycling }}>
      {children}
    </AtmosphereContext.Provider>
  );
}

/** Script inline para pintar el cielo aproximado antes de hidratar (sin parpadeo). */
const BOOT = `(function(){try{var p=new Intl.DateTimeFormat("en-GB",{timeZone:"America/Lima",hour:"2-digit",hourCycle:"h23"}).formatToParts(new Date());var h=12;for(var i=0;i<p.length;i++)if(p[i].type==="hour")h=+p[i].value;var n=h<5||h>=19,k=h>=17&&h<19,a=h>=5&&h<7,r=document.documentElement.style;r.setProperty("--sky-top",n?"#0b0f2e":k?"#5d68c0":a?"#4a5aa8":"#4fb0ee");r.setProperty("--sky-mid",n?"#1a1f4d":k?"#e98aa0":a?"#c487b0":"#98d4f6");r.setProperty("--sky-bottom",n?"#2f2c63":k?"#ffa464":a?"#ffb48a":"#dff3ff");}catch(e){}})();`;

export function AtmosphereBootScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}
