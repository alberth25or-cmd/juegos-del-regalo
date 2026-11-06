import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Sky } from "@/components/village/Sky";
import { PlazaCargando, PlazaCentral } from "@/components/home/Datos";

export const metadata: Metadata = { title: "Noticias y progreso" };

/** Noticias del pueblo, tu progreso, la temporada y los récords. */
export default function PlazaPage() {
  return (
    <main className="relative min-h-[100svh] w-full overflow-x-clip pb-32">
      <Sky />
      <div className="relative z-10 mx-auto max-w-md px-4" style={{ paddingTop: "max(20px, env(safe-area-inset-top))" }}>
        <Link href="/mundo" className="px-chip">
          ← Volver al mundo
        </Link>
      </div>
      <Suspense fallback={<PlazaCargando />}>
        <PlazaCentral />
      </Suspense>
    </main>
  );
}
