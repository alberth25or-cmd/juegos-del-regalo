"use client";

import { useState } from "react";
import { EditorAvatar } from "@/components/rpg/EditorAvatar";
import { Aviso } from "@/components/ui/Pantalla";
import { avatarValido, type ConfigAvatar } from "@/features/avatar";
import { api } from "@/lib/cliente/api";

interface Perfil {
  displayName: string;
  avatar: unknown;
  humorLevel: "light" | "friends" | "chaos";
  allowRoast: boolean;
  allowPublicSharing: boolean;
}

const HUMOR = [
  { v: "light", t: "Suave", d: "Bromas tranquilas, nada ácido." },
  { v: "friends", t: "Entre amigos", d: "Sarcasmo y humor negro moderado." },
  { v: "chaos", t: "Caos", d: "Lo más ácido del catálogo (siempre sin ataques personales)." },
] as const;

export function PerfilForm({ inicial }: { inicial: Perfil }) {
  const [p, setP] = useState({ ...inicial, avatar: avatarValido(inicial.avatar) as ConfigAvatar });
  const [estado, setEstado] = useState<{ tipo: "ok" | "error"; t: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true);
        setEstado(null);
        const r = await api("/api/perfil", { body: p, idempotente: true });
        setEnviando(false);
        setEstado(r.ok ? { tipo: "ok", t: "Guardado. Snowville ya te ve con tu nuevo look." } : { tipo: "error", t: r.error });
      }}
    >
      <div>
        <label className="px-label" htmlFor="dn">
          Nombre visible
        </label>
        <input id="dn" className="px-input" maxLength={30} value={p.displayName} onChange={(e) => setP({ ...p, displayName: e.target.value })} disabled={enviando} />
      </div>

      <EditorAvatar valor={p.avatar} onChange={(avatar) => setP({ ...p, avatar })} disabled={enviando} />

      <fieldset>
        <legend className="px-label">Nivel de humor</legend>
        <div className="mt-1 flex flex-col gap-2">
          {HUMOR.map((h) => (
            <label key={h.v} className="px-box flex cursor-pointer items-start gap-2 px-3 py-2" style={{ ["--bg" as string]: p.humorLevel === h.v ? "var(--cream-2)" : "#fff", margin: "2px 0" }}>
              <input type="radio" name="humor" className="mt-1" checked={p.humorLevel === h.v} onChange={() => setP({ ...p, humorLevel: h.v })} disabled={enviando} />
              <span className="leading-tight">
                <span className="block font-pixel">{h.t}</span>
                <span className="block text-[0.8rem] text-[var(--ink-soft)]">{h.d}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 h-5 w-5" checked={p.allowRoast} onChange={(e) => setP({ ...p, allowRoast: e.target.checked })} disabled={enviando} />
        <span className="leading-tight">
          <span className="block font-pixel">Acepto invitaciones a Roast Battle</span>
          <span className="block text-[0.8rem] text-[var(--ink-soft)]">Siempre es voluntario: igual tendrás que aceptar cada duelo.</span>
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 h-5 w-5" checked={p.allowPublicSharing} onChange={(e) => setP({ ...p, allowPublicSharing: e.target.checked })} disabled={enviando} />
        <span className="leading-tight">
          <span className="block font-pixel">Mi nombre puede salir en tarjetas para compartir</span>
          <span className="block text-[0.8rem] text-[var(--ink-soft)]">Si no, las tarjetas dirán «un agente anónimo». Nada se publica solo.</span>
        </span>
      </label>

      {estado && <Aviso tono={estado.tipo}>{estado.t}</Aviso>}
      <button type="submit" className="px-btn shine" style={{ ["--bg" as string]: "var(--gold)" }} disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

export function BotonSalir() {
  const [enviando, setEnviando] = useState(false);
  return (
    <button
      type="button"
      className="px-chip"
      disabled={enviando}
      onClick={async () => {
        if (!window.confirm("¿Cerrar sesión en este celular? Para volver necesitarás tu usuario y PIN.")) return;
        setEnviando(true);
        await api("/api/salir", { body: {}, idempotente: true });
        // Recarga completa a propósito: la sesión cambió y nada debe quedar en caché.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/");
      }}
    >
      {enviando ? "Saliendo…" : "Cerrar sesión en este celular"}
    </button>
  );
}
