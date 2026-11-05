"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PixelIcon, type IconName } from "@/components/ui/PixelIcon";

const ITEMS: { href: string; label: string; icon: IconName; main?: boolean }[] = [
  { href: "/", label: "Plaza", icon: "home" },
  { href: "/arcade", label: "Arcade", icon: "sparkle" },
  { href: "/arcade/gift-catcher", label: "Jugar", icon: "mission", main: true },
  { href: "/ranking", label: "Ranking", icon: "ranking" },
  { href: "/perfil", label: "Perfil", icon: "friend" },
];

/** Barra inferior con la sección activa resaltada (lee la ruta: va dentro de <Suspense>). */
export function BottomNav() {
  return <BottomNavBar path={usePathname()} />;
}

/** Misma barra sin resaltar nada: respaldo mientras se conoce la ruta. */
export function BottomNavStatic() {
  return <BottomNavBar path="" />;
}

function activo(href: string, path: string) {
  if (href === "/") return path === "/";
  if (href === "/arcade") return path === "/arcade";
  return path.startsWith(href);
}

function BottomNavBar({ path }: { path: string }) {
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-40 px-3" style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
      <div className="px-box mx-auto flex max-w-md items-end justify-between px-2 pb-1.5 pt-1.5" style={{ ["--bg" as string]: "var(--cream)" }}>
        {ITEMS.map((it) => {
          const a = activo(it.href, path);
          if (it.main) {
            return (
              <Link
                key={it.href}
                href={it.href}
                className="px-btn -mt-7 flex-col !gap-0.5 !px-3 !py-2"
                style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}
                aria-current={a ? "page" : undefined}
              >
                <span className="anim-bob">
                  <PixelIcon name={it.icon} size={30} />
                </span>
                <span className="text-[0.72rem]">{it.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={a ? "page" : undefined}
              className="flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-sm px-1 font-pixel text-[0.72rem] transition-transform active:translate-y-0.5"
              style={{ color: a ? "var(--ink)" : "var(--ink-soft)", background: a ? "var(--cream-2)" : undefined }}
            >
              <PixelIcon name={it.icon} size={24} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
