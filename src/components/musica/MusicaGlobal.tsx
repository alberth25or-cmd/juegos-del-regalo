"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import type { NombrePista } from "@/features/musica/villancicos";
import { musica } from "@/lib/cliente/musica";

/** Qué villancico va en cada pantalla. El mundo elige solo (afuera / dentro de una casa). */
function pistaDe(path: string): NombrePista | null | "mundo" {
  if (path.startsWith("/mundo")) return "mundo";
  if (path.startsWith("/arcade/") || path.startsWith("/arena/")) return "juego";
  return "casa";
}

export function useSilenciado() {
  return useSyncExternalStore(musica.suscribir, musica.silenciado, () => false);
}

/** Botón 🔊/🔇 (pixel, ≥ 44 px). */
export function BotonSonido({ className = "", compacto = false }: { className?: string; compacto?: boolean }) {
  const silenciado = useSilenciado();
  return (
    <button
      type="button"
      onClick={() => musica.alternar()}
      aria-pressed={!silenciado}
      aria-label={silenciado ? "Activar música" : "Silenciar música"}
      title={silenciado ? "Activar música" : "Silenciar música"}
      className={`px-btn !min-h-[40px] ${compacto ? "!px-2.5" : "!px-3"} !text-[0.9rem] ${className}`}
      style={{ ["--bg" as string]: "var(--cream)" }}
    >
      {silenciado ? "🔇" : "🔊"}
    </button>
  );
}

/**
 * Vive en el layout: arranca el audio con el primer toque (requisito de los celulares),
 * cambia de villancico según la pantalla y muestra el botón 🔊 fuera del mundo
 * (el mundo tiene el suyo en su barra superior).
 */
export function MusicaGlobal() {
  const path = usePathname();
  const p = pistaDe(path);

  useEffect(() => {
    // Solo en desarrollo: acceso para pruebas automáticas.
    if (process.env.NODE_ENV !== "production") (window as unknown as { __musica: typeof musica }).__musica = musica;
    const desbloquear = () => musica.iniciar();
    window.addEventListener("pointerdown", desbloquear, { passive: true });
    window.addEventListener("keydown", desbloquear);
    return () => {
      window.removeEventListener("pointerdown", desbloquear);
      window.removeEventListener("keydown", desbloquear);
    };
  }, []);

  useEffect(() => {
    if (p !== "mundo") musica.pista(p);
  }, [p]);

  // El mundo y la vista de diseño tienen su propio 🔊 en su barra.
  if (p === "mundo" || path.startsWith("/diseno")) return null;
  return (
    <div className="fixed right-3 z-40" style={{ top: "max(12px, env(safe-area-inset-top))" }}>
      <BotonSonido compacto />
    </div>
  );
}
