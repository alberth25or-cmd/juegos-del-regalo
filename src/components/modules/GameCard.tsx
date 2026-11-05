import Link from "next/link";
import type { GameCardDef } from "@/lib/modules";
import { SPRITES } from "@/lib/assets/manifest";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { NpcSprite } from "@/components/rpg/PixelSprite";
import { Ogre, Snowman } from "./Characters";

/** Tarjeta de juego: ilustración viva, se inclina con el puntero y flota. */
export function GameCard({ card, index, dark }: { card: GameCardDef; index: number; dark?: boolean }) {
  const locked = !card.href;
  const sprite = card.sprite ? SPRITES[card.sprite] : undefined;

  const body = (
    <>
      {/* Ilustración */}
      <div
        className="card-art relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 75%, color-mix(in srgb, ${card.color} 55%, white) 0%, ${card.color} 70%)`,
          height: card.featured ? 170 : 132,
        }}
      >
        {/* patrón pixel de fondo */}
        <div
          aria-hidden
          className="absolute -inset-[18px] opacity-25"
          style={{
            animation: "pattern-move 9s linear infinite",
            backgroundImage:
              "linear-gradient(45deg, rgb(255 255 255 / .5) 25%, transparent 25%, transparent 75%, rgb(255 255 255 / .5) 75%), linear-gradient(45deg, rgb(255 255 255 / .5) 25%, transparent 25%, transparent 75%, rgb(255 255 255 / .5) 75%)",
            backgroundSize: "18px 18px",
            backgroundPosition: "0 0, 9px 9px",
          }}
        />
        {/* rayos que giran detrás */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[62%] h-[260%] w-[260%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "repeating-conic-gradient(rgb(255 255 255 / .28) 0deg 10deg, transparent 10deg 24deg)",
            animation: "spin 24s linear infinite",
          }}
        />
        <div className="absolute inset-x-0 bottom-2 flex justify-center">
          <span className="card-bob block" style={{ animationDelay: `${index * 0.4}s` }}>
            {card.art === "ogre" ? (
              <span className="block" style={{ animation: "snore 2.4s ease-in-out infinite", transformOrigin: "50% 100%" }}>
                <Ogre size={card.featured ? 150 : 110} />
              </span>
            ) : card.npc ? (
              <NpcSprite id={card.npc} size={card.featured ? 104 : 78} />
            ) : card.art === "snowman" ? (
              <Snowman size={card.featured ? 104 : 80} build />
            ) : sprite ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sprite.src}
                alt=""
                className="pixelated block"
                style={{
                  height: card.featured ? 130 : 100,
                  width: "auto",
                  filter: card.mystery ? "brightness(0) drop-shadow(0 0 0 #2a2342)" : undefined,
                }}
                draggable={false}
              />
            ) : (
              <span className="block text-[64px] leading-none" style={{ textShadow: "0 4px 0 rgb(42 35 66 / .35)" }}>
                {card.emoji}
              </span>
            )}
          </span>
        </div>
        {card.mystery && (
          <span className="absolute left-1/2 top-[38%] -translate-x-1/2 font-pixel text-4xl text-white" style={{ animation: "bob 0.9s steps(2) infinite", textShadow: "0 3px 0 #2a2342" }}>
            ?
          </span>
        )}
        <span className="sparkle" style={{ left: "16%", top: "20%", animationDelay: `${index * 0.3}s` }} />
        <span className="sparkle" style={{ left: "80%", top: "34%", animationDelay: `${0.9 + index * 0.3}s` }} />

        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgb(42_35_66/0.62)] text-center">
            <span style={{ animation: "bob 1.4s steps(2) infinite" }}>
              <PixelIcon name="lock" size={30} />
            </span>
            <span className="px-chip">{card.abre?.startsWith("Día") ? `Se abre el ${card.abre.toLowerCase()}` : `Llega en la ${card.abre}`}</span>
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="flex items-end justify-between gap-2 px-3 pb-3 pt-2.5">
        <div className="min-w-0">
          <div className={`font-pixel leading-tight ${card.featured ? "text-[1.35rem]" : "text-[1.1rem]"}`}>{card.title}</div>
          <div className="mt-0.5 truncate text-[0.82rem] text-[var(--ink-soft)]">{card.tagline}</div>
          {card.progress && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-[4px] pl-[2px]" aria-hidden>
                {Array.from({ length: card.progress[1] }, (_, i) => (
                  <span
                    key={i}
                    className="block h-[10px] w-[10px]"
                    style={{
                      background: i < card.progress![0] ? "var(--sky)" : i === card.progress![0] ? "var(--gold)" : "#d9d2c4",
                      boxShadow: "0 0 0 2px var(--ink)",
                      animation: i === card.progress![0] ? "glow-pulse 1s steps(2) infinite" : undefined,
                    }}
                  />
                ))}
              </div>
              <div className="mt-1 text-[0.72rem] text-[var(--ink-soft)]">
                <span className="font-pixel text-[var(--ink)]">
                  {card.progress[0]} de {card.progress[1]}
                </span>{" "}
                · ¡falta tu parte!
              </div>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {card.points && (
            <span className="px-chip" style={{ ["--chip" as string]: "var(--gold)" }}>
              {card.points}
            </span>
          )}
          {card.minutes && <span className="text-[0.7rem] text-[var(--ink-soft)]">{card.minutes}</span>}
        </div>
      </div>

      {card.featured && !locked && (
        <span className="px-chip absolute -top-3 right-3 z-10" style={{ ["--chip" as string]: dark ? "var(--gold)" : "var(--cherry)", color: dark ? "var(--ink)" : "var(--cream)" }}>
          ★ {card.ribbon ?? "Destacado"}
        </span>
      )}
    </>
  );

  if (!card.href) {
    return (
      <div className="game-card px-box block" style={{ ["--bg" as string]: "var(--cream)" }} aria-disabled="true">
        {body}
      </div>
    );
  }
  return (
    <Link href={card.href} className="game-card px-box block" style={{ ["--bg" as string]: "var(--cream)" }}>
      {body}
    </Link>
  );
}
