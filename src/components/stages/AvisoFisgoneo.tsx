"use client";

import { useState } from "react";

/**
 * "👀 Alguien fisgoneó 2 de tus respuestas hoy" (decisión de Luis, 2026-11-09).
 * Nunca dice quién ni cuáles: solo cuántas. Se puede cerrar.
 * shortcut: vista de diseño; en el juego real el número sale del ledger de compras del día.
 */
export function AvisoFisgoneo({ veces }: { veces: number }) {
  const [visible, setVisible] = useState(veces > 0);
  if (!visible) return null;
  return (
    <div className="relative z-[2] mx-auto mt-3 flex max-w-[560px] items-center gap-3 px-4" role="status">
      <div className="clay flex flex-1 items-center gap-3 !rounded-[18px] px-4 py-3">
        <span className="text-[1.6rem] leading-none" aria-hidden>
          👀
        </span>
        <p className="flex-1 text-[0.95rem] font-bold">
          Alguien fisgoneó {veces} de tus respuestas hoy.
          <span className="block text-[0.8rem] font-semibold text-[var(--tinta-suave)]">No sabemos quién ni cuáles… pero alguien tiene curiosidad.</span>
        </p>
        <button type="button" onClick={() => setVisible(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[1.1rem] font-black text-[var(--tinta-suave)] hover:bg-black/5" aria-label="Cerrar aviso">
          ✕
        </button>
      </div>
    </div>
  );
}
