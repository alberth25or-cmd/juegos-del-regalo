"use client";

import { useEffect, useState } from "react";
import { CLAVE_LIGERO, aplicarLigero } from "./ModoLigero";

/** Botón para activar o desactivar el modo ligero a mano. */
export function InterruptorLigero() {
  const [activo, setActivo] = useState<boolean | null>(null);

  useEffect(() => {
    const leer = () => setActivo(document.documentElement.dataset.ligero === "1");
    leer();
    window.addEventListener("ligero-cambio", leer);
    return () => window.removeEventListener("ligero-cambio", leer);
  }, []);

  if (activo === null) return null;
  return (
    <button
      type="button"
      className="px-chip"
      style={{ ["--chip" as string]: activo ? "var(--mint)" : "var(--cream)", color: "var(--ink)" }}
      onClick={() => {
        const nuevo = !activo;
        try {
          localStorage.setItem(CLAVE_LIGERO, nuevo ? "1" : "0");
        } catch {}
        aplicarLigero(nuevo);
      }}
      aria-pressed={activo}
    >
      ⚡ Modo ligero: {activo ? "activado" : "desactivado"}
    </button>
  );
}
