import type { Metadata } from "next";
import { Suspense } from "react";
import { Sky } from "@/components/village/Sky";
import { Simulador } from "@/components/sim/Simulador";

export const metadata: Metadata = { title: "Modo prueba" };

export default function PruebaPage() {
  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden">
      <Sky />
      <Suspense fallback={<p className="relative z-10 p-6 font-pixel">Preparando el modo prueba…</p>}>
        <Simulador />
      </Suspense>
    </main>
  );
}
