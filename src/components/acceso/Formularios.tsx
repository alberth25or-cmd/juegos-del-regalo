"use client";

import Link from "next/link";
import { useActionState, useSyncExternalStore } from "react";
import { crearGrupo, entrar, unirse, type Resultado } from "@/lib/server/acciones";
import { BotonCopiar, CamposAgente, CodigoRescate, MensajeError } from "./Campos";
import { APP_NAME } from "@/lib/config";

const noop = () => () => {};
function useOrigin() {
  return useSyncExternalStore(noop, () => window.location.origin, () => "");
}

function Enviar({ pending, texto }: { pending: boolean; texto: string }) {
  return (
    <button type="submit" className="px-btn shine w-full" disabled={pending} style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
      {pending ? "Procesando…" : texto}
    </button>
  );
}

// ------------------------------------------------------------ crear grupo
export function CrearGrupoForm() {
  const [state, action, pending] = useActionState<Resultado, FormData>(crearGrupo, null);
  const origin = useOrigin();

  if (state?.ok) {
    const link = `${origin}/unirse/${state.inviteCode}`;
    const msg = `🎁 ¡Únete a "${state.groupName}" en ${APP_NAME}! Amigo secreto en modo agentes: ${link}`;
    return (
      <div className="flex flex-col gap-4">
        <p className="font-pixel text-lg">¡Grupo creado, organizador! 🎉</p>
        <CodigoRescate codigo={state.rescueCode!} />
        <div className="px-box p-4">
          <p className="font-pixel">Enlace de invitación</p>
          <p className="my-2 break-all text-[0.9rem]">{link}</p>
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
          <p className="px-hint mt-2">Mándalo al grupo de WhatsApp. Cada persona que entre quedará pendiente hasta que tú la apruebes.</p>
        </div>
        <Link href="/panel" className="px-btn w-full" style={{ ["--bg" as string]: "var(--gold)" }}>
          Ir a mi panel de organizador
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="px-label" htmlFor="grupo">
          Nombre del grupo
        </label>
        <input id="grupo" name="grupo" className="px-input" placeholder="Los Agentes del Panetón" maxLength={60} required disabled={pending} />
      </div>
      <CamposAgente disabled={pending} />
      <label className="flex items-start gap-2 text-[0.88rem]">
        <input type="checkbox" name="acepto" value="si" required className="mt-1 h-5 w-5 accent-[var(--cherry)]" disabled={pending} />
        <span>
          Entiendo que <b>el dinero lo manejamos nosotros</b>. Esta página solo cuenta puntos y no recibe ni guarda dinero.
        </span>
      </label>
      <MensajeError texto={state && !state.ok ? state.error : undefined} />
      <Enviar pending={pending} texto="Crear grupo" />
    </form>
  );
}

// ------------------------------------------------------------- unirse
export function UnirseForm({ codigo, grupo }: { codigo: string; grupo: string }) {
  const [state, action, pending] = useActionState<Resultado, FormData>(unirse, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-pixel text-lg">¡Bienvenido a {grupo}, agente! 🕵️</p>
        <CodigoRescate codigo={state.rescueCode!} />
        <div className="px-box p-4" style={{ ["--bg" as string]: "var(--mint)" }}>
          <p className="font-pixel">⏳ Esperando aprobación</p>
          <p className="mt-1 text-[0.9rem]">El organizador tiene que aprobarte. Mientras tanto ya puedes pasear por la aldea.</p>
        </div>
        <Link href="/" className="px-btn w-full" style={{ ["--bg" as string]: "var(--gold)" }}>
          Ir a la aldea
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="codigo" value={codigo} />
      <CamposAgente disabled={pending} />
      <MensajeError texto={state && !state.ok ? state.error : undefined} />
      <Enviar pending={pending} texto="Unirme al grupo" />
    </form>
  );
}

// -------------------------------------------------------------- entrar
export function EntrarForm() {
  const [state, action, pending] = useActionState<Resultado, FormData>(entrar, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="px-label" htmlFor="rescate">
          Código de rescate
        </label>
        <input
          id="rescate"
          name="rescate"
          className="px-input pin !text-[1.3rem] !tracking-[0.2em] uppercase"
          placeholder="XXXX-XXXX"
          maxLength={9}
          required
          disabled={pending}
          autoComplete="off"
          autoCapitalize="characters"
        />
      </div>
      <div>
        <label className="px-label" htmlFor="pin">
          Tu PIN
        </label>
        <input id="pin" name="pin" className="px-input pin" type="password" inputMode="numeric" pattern="\d{4}" maxLength={4} required disabled={pending} autoComplete="current-password" />
      </div>
      <MensajeError texto={state && !state.ok ? state.error : undefined} />
      <Enviar pending={pending} texto="Entrar" />
      <p className="px-hint">¿Perdiste tu código? Pídele al organizador que te ayude desde su panel.</p>
    </form>
  );
}
