"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const VISTAS = [
  ["/diseno", "Principal"],
  ["/diseno/manada", "La manada"],
  ["/diseno/inscripcion", "Ficha"],
  ["/diseno/arbol", "Árbol"],
  ["/diseno/amigo-secreto", "Amigo secreto"],
  ["/diseno/organizador", "Organizador"],
] as const;

export function NavDiseno() {
  const path = usePathname();
  return (
    <nav aria-label="Pantallas de diseño" className="no-scrollbar flex items-center gap-1 overflow-x-auto bg-black/35 px-3 py-1.5 text-[0.82rem] font-bold">
      <span className="mr-2 shrink-0 rounded-full bg-[var(--oro)] px-2.5 py-0.5 text-[0.75rem] font-extrabold text-[var(--tinta)]">Vista de diseño</span>
      {VISTAS.map(([href, txt]) => (
        <Link
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
          className="flex min-h-9 shrink-0 items-center rounded-full px-3 text-[var(--hielo)] aria-[current=page]:bg-white/15 aria-[current=page]:text-white"
        >
          {txt}
        </Link>
      ))}
    </nav>
  );
}
