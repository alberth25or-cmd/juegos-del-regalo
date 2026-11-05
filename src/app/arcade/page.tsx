import type { Metadata } from "next";
import { Pantalla } from "@/components/ui/Pantalla";
import { GameCard } from "@/components/modules/GameCard";
import { MODULES } from "@/lib/modules";

export const metadata: Metadata = { title: "Arcade" };

const ARCADE = MODULES.find((m) => m.id === "arcade")!;

export default function ArcadePage() {
  return (
    <Pantalla title="Arcade de Snowville" kicker="Yo contra todos" npc="rudolf">
      <p className="mb-5 text-[0.92rem]">{ARCADE.description}</p>
      <div className="flex flex-col gap-5">
        {ARCADE.cards.map((c, i) => (
          <GameCard key={c.id} card={c} index={i} />
        ))}
      </div>
      <div className="px-box mt-6 p-3 text-[0.82rem]" style={{ ["--bg" as string]: "var(--cream-2)" }}>
        <p className="font-pixel">¿Cómo se puntúa?</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Cada partida validada da XP y monedas.</li>
          <li>Al ranking solo va tu mejor partida del día: 20 pts por jugar + hasta 80 por resultado.</li>
          <li>El servidor revisa cada partida: puntajes imposibles no cuentan.</li>
        </ul>
      </div>
    </Pantalla>
  );
}
