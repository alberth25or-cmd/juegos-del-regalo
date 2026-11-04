"use client";

import { useState } from "react";
import { AVATARES } from "@/lib/avatares";

const NOMBRES = [
  "Mantequilla", "Chocotón", "Panetón", "Pisco Sour", "Rocoto", "Lúcuma", "Alfajor", "Cancha",
  "Mazamorra", "Picarón", "Turrón", "Chicha", "Anticucho", "Causa", "Ají Panca", "Tamalito",
];

/** Campos comunes de un agente: apodo, nombre clave, avatar y PIN. */
export function CamposAgente({ disabled }: { disabled?: boolean }) {
  const [codename, setCodename] = useState("");
  const [avatar, setAvatar] = useState(AVATARES[0]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="px-label" htmlFor="apodo">
          Tu apodo
        </label>
        <input id="apodo" name="apodo" className="px-input" placeholder="Como te dicen en el grupo" maxLength={40} required disabled={disabled} autoComplete="nickname" />
      </div>

      <div>
        <label className="px-label" htmlFor="nombreClave">
          Nombre de agente
        </label>
        <div className="flex gap-2">
          <input
            id="nombreClave"
            name="nombreClave"
            className="px-input flex-1"
            placeholder="Agente Mantequilla"
            maxLength={40}
            required
            disabled={disabled}
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            className="px-btn !min-h-0 !px-3"
            style={{ ["--bg" as string]: "var(--lavender)" }}
            onClick={() => setCodename(`Agente ${NOMBRES[Math.floor(Math.random() * NOMBRES.length)]}`)}
            aria-label="Sugerir un nombre de agente"
            disabled={disabled}
          >
            🎲
          </button>
        </div>
        <p className="px-hint mt-1">Así te verán en el ranking. Nadie sabrá tu nombre real si no quieres.</p>
      </div>

      <fieldset>
        <legend className="px-label">Tu avatar</legend>
        <input type="hidden" name="avatar" value={avatar} />
        <div className="mt-1 grid grid-cols-6 gap-2">
          {AVATARES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              aria-pressed={a === avatar}
              aria-label={`Avatar ${a}`}
              disabled={disabled}
              className="flex aspect-square items-center justify-center text-2xl transition-transform"
              style={{
                background: a === avatar ? "var(--gold)" : "#fff",
                boxShadow: `0 0 0 ${a === avatar ? 3 : 2}px var(--ink)`,
                transform: a === avatar ? "translateY(-2px) scale(1.06)" : undefined,
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="px-label" htmlFor="pin">
            PIN (4 números)
          </label>
          <input id="pin" name="pin" className="px-input pin" type="password" inputMode="numeric" pattern="\d{4}" maxLength={4} required disabled={disabled} autoComplete="new-password" />
        </div>
        <div>
          <label className="px-label" htmlFor="pin2">
            Repite el PIN
          </label>
          <input id="pin2" name="pin2" className="px-input pin" type="password" inputMode="numeric" pattern="\d{4}" maxLength={4} required disabled={disabled} autoComplete="new-password" />
        </div>
      </div>
      <p className="px-hint -mt-2">Lo pediremos solo si entras desde otro celular. No uses 1234 ni 0000 😉</p>
    </div>
  );
}

export function MensajeError({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="px-box px-3 py-2 text-[0.9rem]" style={{ ["--bg" as string]: "#ffe1e6" }}>
      ⚠️ {texto}
    </p>
  );
}

export function BotonCopiar({ valor, etiqueta = "Copiar" }: { valor: string; etiqueta?: string }) {
  const [hecho, setHecho] = useState(false);
  return (
    <button
      type="button"
      className="px-btn !min-h-0 !px-3 !py-2 !text-[0.85rem]"
      style={{ ["--bg" as string]: hecho ? "var(--mint)" : "var(--cream)" }}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(valor);
          setHecho(true);
          window.setTimeout(() => setHecho(false), 1800);
        } catch {}
      }}
    >
      {hecho ? "¡Copiado!" : etiqueta}
    </button>
  );
}

/** Código de rescate: se muestra UNA vez, con aviso de guardarlo. */
export function CodigoRescate({ codigo }: { codigo: string }) {
  return (
    <div className="px-box p-4" style={{ ["--bg" as string]: "var(--cream-2)" }}>
      <span className="stamp-static font-pixel text-[0.75rem] text-[var(--cherry)]">CONFIDENCIAL</span>
      <p className="mt-1 font-pixel">Tu código de rescate</p>
      <div className="my-2 flex items-center justify-between gap-2">
        <span className="font-pixel text-[1.9rem] tracking-[0.12em]">{codigo}</span>
        <BotonCopiar valor={codigo} />
      </div>
      <p className="px-hint">
        Guárdalo (captura de pantalla o en tus notas). Con este código y tu PIN puedes entrar desde otro celular. <b>No lo volveremos a mostrar.</b>
      </p>
    </div>
  );
}
