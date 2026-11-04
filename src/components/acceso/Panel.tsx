"use client";

import { useActionState, useSyncExternalStore } from "react";
import { nuevoCodigoRescate, type Resultado } from "@/lib/server/acciones";
import { BotonCopiar } from "./Campos";
import { APP_NAME } from "@/lib/config";

const noop = () => () => {};

export function EnlaceInvitacion({ inviteCode, grupo }: { inviteCode: string; grupo: string }) {
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const link = `${origin}/unirse/${inviteCode}`;
  const msg = `🎁 ¡Únete a "${grupo}" en ${APP_NAME}! Amigo secreto en modo agentes: ${link}`;
  return (
    <div className="px-box p-4" style={{ ["--bg" as string]: "var(--cream-2)" }}>
      <p className="font-pixel">Enlace de invitación</p>
      <p className="my-2 break-all text-[0.9rem]">{origin ? link : "…"}</p>
      <div className="flex flex-wrap gap-2">
        <BotonCopiar valor={link} etiqueta="Copiar enlace" />
        <a
          href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noreferrer"
          className="px-btn !min-h-0 !px-3 !py-2 !text-[0.85rem]"
          style={{ ["--bg" as string]: "var(--mint)" }}
        >
          Enviar por WhatsApp
        </a>
      </div>
    </div>
  );
}

export function NuevoCodigo({ memberId }: { memberId: string }) {
  const [state, action, pending] = useActionState<Resultado, FormData>(nuevoCodigoRescate, null);
  if (state?.ok && state.rescueCode) {
    return (
      <span className="flex items-center gap-2">
        <span className="font-pixel tracking-wider">{state.rescueCode}</span>
        <BotonCopiar valor={state.rescueCode} />
      </span>
    );
  }
  return (
    <form action={action}>
      <input type="hidden" name="memberId" value={memberId} />
      <button
        type="submit"
        disabled={pending}
        className="px-chip"
        title="Genera un código nuevo para quien perdió el suyo. Mándaselo por privado."
        onClick={(e) => {
          if (!confirm("¿Generar un código de rescate nuevo? El anterior dejará de funcionar.")) e.preventDefault();
        }}
      >
        {pending ? "…" : "🔑 Nuevo código"}
      </button>
    </form>
  );
}
