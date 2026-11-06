import { PixelSprite } from "@/components/rpg/PixelSprite";
import { avatarSprite } from "@/components/rpg/sprites";
import { avatarValido } from "@/features/avatar";

/** Solo la cabeza del avatar (gorro, cara y bufanda): es lo que se ve en la barra y en el árbol. */
export function Cabeza({ config, size = 28, yo = false, bola = false, title }: { config: unknown; size?: number; yo?: boolean; bola?: boolean; title?: string }) {
  const s = avatarSprite(avatarValido(config));
  const cabeza = <PixelSprite sprite={{ rows: s.rows.slice(0, 11), colors: s.colors }} size={size} title={title} />;
  if (!yo && !bola) return cabeza;
  // "bola" = adorno navideño redondo; "yo" agrega el aro rojo (con el texto "Tú" al lado donde importa).
  return (
    <span
      className="relative inline-grid place-items-center rounded-full"
      style={{
        width: size * 1.55,
        height: size * 1.55,
        background: "radial-gradient(circle at 35% 30%, #fff 0, #fbeedd 45%, #e9d6bd 100%)",
        boxShadow: yo ? "0 0 0 3px var(--rojo-boton), 0 0 0 6px #fff" : "0 0 0 2px rgb(255 255 255 / 0.7)",
      }}
    >
      <span className="absolute -top-[5px] left-1/2 h-[7px] w-[12px] -translate-x-1/2 rounded-[3px] bg-[var(--oro)]" aria-hidden />
      {cabeza}
    </span>
  );
}
