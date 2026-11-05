"use client";

import { avatarAlAzar, NOMBRES_ACCESORIO, NOMBRES_GORRO, OPCIONES_AVATAR, type CampoAvatar, type ConfigAvatar } from "@/features/avatar";
import { Avatar } from "./PixelSprite";

const COLORES: { campo: CampoAvatar; label: string }[] = [
  { campo: "piel", label: "Piel" },
  { campo: "pelo", label: "Pelo" },
  { campo: "abrigo", label: "Abrigo" },
  { campo: "bufanda", label: "Bufanda" },
  { campo: "colorGorro", label: "Color del gorro" },
];

/** Editor de avatar pixel: vista previa grande + opciones con botones táctiles. */
export function EditorAvatar({ valor, onChange, disabled }: { valor: ConfigAvatar; onChange: (a: ConfigAvatar) => void; disabled?: boolean }) {
  const set = (campo: CampoAvatar, v: string) => onChange({ ...valor, [campo]: v } as ConfigAvatar);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-4">
        <div className="flex h-[132px] w-[112px] shrink-0 items-end justify-center bg-[var(--sky)] pb-2" style={{ boxShadow: "0 0 0 3px var(--ink)" }}>
          <span className="anim-bob">
            <Avatar config={valor} size={84} />
          </span>
        </div>
        <button type="button" className="px-btn !min-h-[44px] !text-[0.9rem]" style={{ ["--bg" as string]: "var(--lavender)" }} onClick={() => onChange(avatarAlAzar())} disabled={disabled}>
          🎲 Sorpréndeme
        </button>
      </div>

      <Opciones label="Gorro" valores={OPCIONES_AVATAR.gorro} actual={valor.gorro} nombres={NOMBRES_GORRO} onPick={(v) => set("gorro", v)} disabled={disabled} />
      <Opciones label="Accesorio" valores={OPCIONES_AVATAR.accesorio} actual={valor.accesorio} nombres={NOMBRES_ACCESORIO} onPick={(v) => set("accesorio", v)} disabled={disabled} />

      {COLORES.map(({ campo, label }) =>
        campo === "colorGorro" && (valor.gorro === "ninguno" || valor.gorro === "reno" || valor.gorro === "corona") ? null : (
          <fieldset key={campo}>
            <legend className="px-label">{label}</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {(OPCIONES_AVATAR[campo] as readonly string[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`${label} ${c}`}
                  aria-pressed={valor[campo] === c}
                  disabled={disabled}
                  onClick={() => set(campo, c)}
                  className="h-9 w-9 transition-transform"
                  style={{
                    background: c,
                    boxShadow: valor[campo] === c ? "0 0 0 3px var(--ink), 0 0 0 6px var(--gold)" : "0 0 0 2px var(--ink)",
                    transform: valor[campo] === c ? "translateY(-2px)" : undefined,
                  }}
                />
              ))}
            </div>
          </fieldset>
        ),
      )}
    </div>
  );
}

function Opciones({ label, valores, actual, nombres, onPick, disabled }: { label: string; valores: readonly string[]; actual: string; nombres: Record<string, string>; onPick: (v: string) => void; disabled?: boolean }) {
  return (
    <fieldset>
      <legend className="px-label">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {valores.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={actual === v}
            disabled={disabled}
            onClick={() => onPick(v)}
            className="px-chip !min-h-[36px] !px-2.5 !text-[0.78rem]"
            style={{ ["--chip" as string]: actual === v ? "var(--gold)" : "#fff" }}
          >
            {nombres[v] ?? v}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
