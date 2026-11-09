"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BotonSonido } from "@/components/musica/MusicaGlobal";

const VISTAS = [
  ["/", "Principal"],
  ["/diseno/manada", "La manada"],
  ["/diseno/amor", "Amor"],
  ["/diseno/picante", "Picante"],
  ["/diseno/inscripcion", "Ficha"],
  ["/diseno/arbol", "Árbol"],
  ["/diseno/amigo-secreto", "Amigo secreto"],
  ["/diseno/organizador", "Organizador"],
  ["/mundo", "Snowville"],
  ["/inicio", "Entrar"],
] as const;

export function NavDiseno() {
  const path = usePathname();
  return (
    <div className="flex items-center gap-2 bg-black/35 py-1.5 pl-3 pr-2">
      <nav aria-label="Pantallas de diseño" className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[0.82rem] font-bold">
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
      {/* El 🔊 va aquí y no flotando: flotando tapaba las pestañas en celular. */}
      <BotonSonido compacto className="shrink-0" />
    </div>
  );
}
