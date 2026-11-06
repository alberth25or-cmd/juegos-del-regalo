import { PixelSprite } from "@/components/rpg/PixelSprite";
import { avatarSprite } from "@/components/rpg/sprites";
import { avatarValido } from "@/features/avatar";

/** Solo la cabeza del avatar (gorro, cara y bufanda): es lo que se ve en la barra y en el árbol. */
export function Cabeza({ config, size = 28, yo = false, title }: { config: unknown; size?: number; yo?: boolean; title?: string }) {
  const s = avatarSprite(avatarValido(config));
  const cabeza = <PixelSprite sprite={{ rows: s.rows.slice(0, 11), colors: s.colors }} size={size} title={title} />;
  if (!yo) return cabeza;
  // Marco rojo + etiqueta: "tú" no depende solo del color.
  return (
    <span className="relative inline-block p-[3px]" style={{ background: "var(--cherry)" }}>
      {cabeza}
    </span>
  );
}
