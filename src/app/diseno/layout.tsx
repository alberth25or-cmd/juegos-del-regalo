import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { FondoNavidad } from "@/components/stages/Decoracion";
import { NavDiseno } from "./NavDiseno";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Diseño · Los Juegos del Regalo",
  robots: { index: false },
};

/** Vista de diseño: las pantallas de la reorientación con datos de ejemplo. */
export default function DisenoLayout({ children }: LayoutProps<"/diseno">) {
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
