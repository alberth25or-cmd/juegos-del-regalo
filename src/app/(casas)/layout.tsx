import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { FondoNavidad } from "@/components/stages/Decoracion";
import { NavDiseno } from "./NavDiseno";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Los Juegos del Regalo",
  robots: { index: false },
};

/**
 * Pantalla principal del juego (decisión de Luis, 2026-11-09): la aldea de casas vive en "/" y
 * las demás pantallas del juego nuevo en /diseno/*. Todo con datos de ejemplo hasta que los
 * frentes 2–5 lo conecten a la base de datos. Snowville sigue en /mundo.
 */
export default function CasasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`tema-fiesta ${fredoka.variable} ${nunito.variable}`}>
      <FondoNavidad />
      <div className="relative z-[1]">
        <NavDiseno />
        {children}
      </div>
    </div>
  );
}
