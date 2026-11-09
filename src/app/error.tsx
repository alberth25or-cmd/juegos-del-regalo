"use client";

import Link from "next/link";
import { useEffect } from "react";
import { NpcSprite } from "@/components/rpg/PixelSprite";

/** Si algo falla, nunca dejamos una pantalla en blanco: explicamos y ofrecemos reintentar. */
export default function ErrorGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#1b1f4a] px-4 pb-32">
      <div className="px-box flex max-w-sm flex-col items-center gap-3 p-5 text-center">
        <NpcSprite id="duende" size={72} />
        <h1 className="font-pixel text-2xl">Se cayó la fábrica</h1>
        <p className="text-[0.9rem]">El servidor no respondió a tiempo. Puede ser tu señal o que estamos ocupados. Tus monedas están a salvo.</p>
        <button type="button" onClick={reset} className="px-btn w-full" style={{ ["--bg" as string]: "var(--gold)" }}>
          ↻ Intentar otra vez
        </button>
        <Link href="/" className="text-[0.85rem] underline">
          Volver a la plaza
        </Link>
      </div>
    </main>
  );
}
