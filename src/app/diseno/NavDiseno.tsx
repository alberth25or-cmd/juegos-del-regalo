"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const VISTAS = [
  ["/diseno", "Principal"],
  ["/diseno/inscripcion", "Ficha"],
  ["/diseno/arbol", "Árbol"],
  ["/diseno/amigo-secreto", "Amigo secreto"],
  ["/diseno/organizador", "Organizador"],
] as const;

export function NavDiseno() {
  const path = usePathname();
  return (
    <nav aria-label="Pantallas de diseño" className="flex items-center gap-1 overflow-x-auto bg-black/40 px-3 py-1.5 text-[0.8rem]">
      <span className="mr-2 shrink-0 font-pixel text-[var(--gold)]">Vista de diseño · datos de ejemplo</span>
      {VISTAS.map(([href, txt]) => (
        <Link
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
          className="flex min-h-9 shrink-0 items-center px-2.5 text-[var(--texto-suave)] aria-[current=page]:bg-[var(--noche-3)] aria-[current=page]:text-[var(--cream)]"
        >
          {txt}
        </Link>
      ))}
    </nav>
  );
}
