"use client";

import { useState } from "react";
import { AVATAR_POR_DEFECTO, type ConfigAvatar } from "@/features/avatar";
import { EditorAvatar } from "@/components/rpg/EditorAvatar";

export interface DatosForm {
  username: string;
  displayName: string;
  avatar: ConfigAvatar;
  pin: string;
  pin2: string;
}

/** Usuario sugerido a partir del nombre visible (el servidor lo vuelve a normalizar). */
function sugerirUsuario(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s.-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

/** Campos comunes de un jugador: nombre visible, usuario, avatar y PIN. */
export function CamposJugador({ datos, setDatos, disabled }: { datos: DatosForm; setDatos: (d: DatosForm) => void; disabled?: boolean }) {
  const [usuarioTocado, setUsuarioTocado] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="px-label" htmlFor="displayName">
          ¿Cómo te verán los demás?
        </label>
        <input
          id="displayName"
          className="px-input"
          placeholder="Ej. Luchito"
          maxLength={30}
          required
          disabled={disabled}
          value={datos.displayName}
          autoComplete="nickname"
          onChange={(e) => {
            const displayName = e.target.value;
            setDatos({ ...datos, displayName, username: usuarioTocado ? datos.username : sugerirUsuario(displayName) });
          }}
        />
      </div>
      <div>
        <label className="px-label" htmlFor="username">
          Tu usuario (para entrar desde otro celular)
        </label>
        <input
          id="username"
          className="px-input"
          placeholder="luchito"
          maxLength={20}
          required
          disabled={disabled}
          value={datos.username}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="username"
          onChange={(e) => {
            setUsuarioTocado(true);
            setDatos({ ...datos, username: sugerirUsuario(e.target.value) });
          }}
        />
        <p className="px-hint mt-1">Solo letras, números y _. Anótalo: con tu usuario y tu PIN entras desde cualquier celular.</p>
      </div>

      <div>
        <p className="px-label">Tu personaje</p>
        <EditorAvatar valor={datos.avatar} onChange={(avatar) => setDatos({ ...datos, avatar })} disabled={disabled} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="px-label" htmlFor="pin">
            PIN (4 números)
          </label>
          <input
            id="pin"
            className="px-input pin"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            required
            disabled={disabled}
            value={datos.pin}
            autoComplete="new-password"
            onChange={(e) => setDatos({ ...datos, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          />
        </div>
        <div>
          <label className="px-label" htmlFor="pin2">
            Repite el PIN
          </label>
          <input
            id="pin2"
            className="px-input pin"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            required
            disabled={disabled}
            value={datos.pin2}
            autoComplete="new-password"
            onChange={(e) => setDatos({ ...datos, pin2: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          />
        </div>
      </div>
      <p className="px-hint -mt-2">Nada de 1234 ni 0000. Si lo olvidas, el organizador te lo reinicia.</p>
    </div>
  );
}

export const DATOS_INICIALES: DatosForm = { username: "", displayName: "", avatar: AVATAR_POR_DEFECTO, pin: "", pin2: "" };

/** Validación rápida en el navegador (el servidor valida de nuevo, siempre). */
export function errorLocal(d: DatosForm): string | null {
  if (d.displayName.trim().length < 2) return "Escribe cómo te verán los demás (mínimo 2 letras).";
  if (!/^[a-z0-9_]{3,20}$/.test(d.username)) return "Tu usuario debe tener entre 3 y 20 letras o números.";
  if (!/^\d{4}$/.test(d.pin)) return "El PIN debe tener 4 números.";
  if (d.pin !== d.pin2) return "Los dos PIN no coinciden.";
  return null;
}
