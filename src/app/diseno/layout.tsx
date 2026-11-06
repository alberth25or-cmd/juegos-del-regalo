import type { Metadata } from "next";
import { NavDiseno } from "./NavDiseno";

export const metadata: Metadata = {
  title: "Diseño · Los Juegos del Regalo",
  robots: { index: false },
};

/** Vista de diseño del Frente 1: las pantallas de la reorientación con datos de ejemplo. */
export default function DisenoLayout({ children }: LayoutProps<"/diseno">) {
  return (
    <div className="tema-noche nieve-fondo">
      <NavDiseno />
      {children}
    </div>
  );
}
