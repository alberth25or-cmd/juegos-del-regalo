"use client";

import { useEffect } from "react";

/**
 * Modo ligero: apaga los efectos más pesados en celulares básicos.
 * - Preferencia guardada (`jdr:ligero` = "1" / "0") manda siempre.
 * - Si no hay preferencia, se decide solo: poca memoria, pocos núcleos,
 *   ahorro de datos, "reducir movimiento" o si la página va lenta al cargar.
 */
export const CLAVE_LIGERO = "jdr:ligero";

/** Script que corre antes de pintar, para no mostrar efectos pesados ni un instante. */
export const SCRIPT_LIGERO = `(function(){try{var p=localStorage.getItem("${CLAVE_LIGERO}");var n=navigator,l=false;if(p==="1")l=true;else if(p!=="0"){var m=n.deviceMemory,c=n.hardwareConcurrency,s=n.connection&&n.connection.saveData;l=(m&&m<=4)||(c&&c<=4)||s||matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("jdr:lento")==="1";}document.documentElement.dataset.ligero=l?"1":"0";}catch(e){}})();`;

export function aplicarLigero(activo: boolean) {
  document.documentElement.dataset.ligero = activo ? "1" : "0";
  window.dispatchEvent(new CustomEvent("ligero-cambio"));
}

export function ModoLigero() {
  useEffect(() => {
    let pref: string | null = null;
    try {
      pref = localStorage.getItem(CLAVE_LIGERO);
    } catch {}
    if (pref !== null || document.documentElement.dataset.ligero === "1") return;

    // Medimos ~1,5 s de fluidez después de cargar. Si va lento, pasamos a ligero.
    let raf = 0;
    let frames = 0;
    let lentos = 0;
    let last = 0;
    const inicio = window.setTimeout(() => {
      const t0 = performance.now();
      last = t0;
      const paso = (now: number) => {
        const dt = now - last;
        last = now;
        frames++;
        if (dt > 34) lentos++;
        if (now - t0 < 1500) raf = requestAnimationFrame(paso);
        else if (frames > 10 && lentos / frames > 0.35) {
          try {
            sessionStorage.setItem("jdr:lento", "1");
          } catch {}
          aplicarLigero(true);
        }
      };
      raf = requestAnimationFrame(paso);
    }, 2500);
    return () => {
      window.clearTimeout(inicio);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
