"use client";

import { useEffect, useState } from "react";

/**
 * Modo ligero: en celulares MUY básicos quita solo lo más pesado para la
 * tarjeta gráfica (aurora, rayos de sol y neblina). Todo el movimiento se mantiene.
 * - Preferencia guardada (`jdr:ligero` = "1" / "0") manda siempre.
 * - Sin preferencia: ahorro de datos, "reducir movimiento", ≤ 2 GB de RAM o
 *   ≤ 2 núcleos, o si la aldea va realmente lenta DESPUÉS de la intro.
 */
export const CLAVE_LIGERO = "jdr:ligero";
const CLAVE_LENTO = "jdr:lento-v2";

/** Script que corre antes de pintar. */
export const SCRIPT_LIGERO = `(function(){try{var p=localStorage.getItem("${CLAVE_LIGERO}");var n=navigator,l=false;if(p==="1")l=true;else if(p!=="0"){var m=n.deviceMemory,c=n.hardwareConcurrency,s=n.connection&&n.connection.saveData;l=(m&&m<=2)||(c&&c<=2)||s||matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${CLAVE_LENTO}")==="1";}document.documentElement.dataset.ligero=l?"1":"0";}catch(e){}})();`;

export function aplicarLigero(activo: boolean) {
  document.documentElement.dataset.ligero = activo ? "1" : "0";
  window.dispatchEvent(new CustomEvent("ligero-cambio"));
}

export function ModoLigero() {
  const [aviso, setAviso] = useState(false);

  useEffect(() => {
    let pref: string | null = null;
    try {
      pref = localStorage.getItem(CLAVE_LIGERO);
    } catch {}
    if (pref !== null || document.documentElement.dataset.ligero === "1") return;

    let raf = 0;
    let timer = 0;
    // Medimos 2 s de fluidez, pero solo cuando ya terminó la intro del cielo.
    const medir = () => {
      let frames = 0;
      let lentos = 0;
      const t0 = performance.now();
      let last = t0;
      const paso = (now: number) => {
        const dt = now - last;
        last = now;
        frames++;
        if (dt > 45) lentos++;
        if (now - t0 < 2000) raf = requestAnimationFrame(paso);
        else if (frames > 12 && lentos / frames > 0.5) {
          try {
            sessionStorage.setItem(CLAVE_LENTO, "1");
          } catch {}
          aplicarLigero(true);
          setAviso(true);
        }
      };
      raf = requestAnimationFrame(paso);
    };
    const cuandoLlegue = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => document.visibilityState === "visible" && medir(), 2500);
    };
    if (document.documentElement.dataset.arrived === "1") cuandoLlegue();
    window.addEventListener("aldea-llegada", cuandoLlegue);
    return () => {
      window.removeEventListener("aldea-llegada", cuandoLlegue);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!aviso) return null;
  return (
    <div className="fixed inset-x-0 z-[70] flex justify-center px-4" style={{ top: "calc(max(12px, env(safe-area-inset-top)) + 100px)" }} role="status">
      <div className="px-box anim-pop flex max-w-md items-center gap-3 px-3 py-2 text-[0.85rem]" style={{ ["--bg" as string]: "var(--mint)" }}>
        <span>⚡ Activamos el modo ligero porque tu celular iba un poco lento.</span>
        <button
          type="button"
          className="px-chip shrink-0"
          onClick={() => {
            try {
              localStorage.setItem(CLAVE_LIGERO, "0");
              sessionStorage.removeItem(CLAVE_LENTO);
            } catch {}
            aplicarLigero(false);
            setAviso(false);
          }}
        >
          Desactivar
        </button>
        <button type="button" className="font-pixel" aria-label="Cerrar aviso" onClick={() => setAviso(false)}>
          ✕
        </button>
      </div>
    </div>
  );
}
