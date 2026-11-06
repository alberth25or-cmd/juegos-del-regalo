"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { api } from "@/lib/cliente/api";
import { Aviso } from "@/components/ui/Pantalla";
import { CamposJugador, DATOS_INICIALES, errorLocal, type DatosForm } from "./FormJugador";

function useEnvio() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return { enviando, setEnviando, error, setError };
}

/** Recarga completa: así todas las pantallas leen la sesión nueva sin cachés viejas. */
function irALaPlaza() {
  // Recarga completa a propósito: la sesión cambió y nada debe quedar en caché.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/");
}

// ------------------------------------------------------------ crear temporada
export function CrearTemporadaForm() {
  const [nombre, setNombre] = useState("Christmas Chaos 2026");
  const [prueba, setPrueba] = useState(false);
  const [datos, setDatos] = useState<DatosForm>(DATOS_INICIALES);
  const [creada, setCreada] = useState<string | null>(null);
  const e = useEnvio();

  if (creada) return <EnlaceInvitacion codigo={creada} />;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (ev) => {
        ev.preventDefault();
        const local = nombre.trim().length < 2 ? "Ponle nombre a la temporada." : errorLocal(datos);
        if (local) return e.setError(local);
        e.setEnviando(true);
        e.setError(null);
        const r = await api<{ inviteCode: string }>("/api/temporada", { body: { nombre, prueba, ...datos } });
        e.setEnviando(false);
        if (r.ok) setCreada(r.inviteCode);
        else e.setError(r.error);
      }}
    >
      <div>
        <label className="px-label" htmlFor="nombre">
          Nombre de la temporada
        </label>
        <input id="nombre" className="px-input" maxLength={60} value={nombre} onChange={(ev) => setNombre(ev.target.value)} disabled={e.enviando} required />
        <p className="px-hint mt-1">Del 25 de noviembre al 24 de diciembre (lo puedes cambiar en el panel).</p>
      </div>
      <label className="px-box flex cursor-pointer items-start gap-3 px-3 py-2" style={{ ["--bg" as string]: prueba ? "var(--lavender)" : "#fff" }}>
        <input
          type="checkbox"
          className="mt-1 h-5 w-5"
          checked={prueba}
          disabled={e.enviando}
          onChange={(ev) => {
            setPrueba(ev.target.checked);
            if (ev.target.checked && nombre === "Christmas Chaos 2026") setNombre("Prueba con el equipo");
          }}
        />
        <span className="leading-tight">
          <span className="block font-pixel">🧪 Es una temporada de prueba</span>
          <span className="block text-[0.8rem]">Para probar todo hoy con tus amigos: sin topes diarios y puedes simular cualquier día desde el panel. Va aparte de la temporada real.</span>
        </span>
      </label>
      <p className="font-pixel text-lg">Tú, el organizador</p>
      <CamposJugador datos={datos} setDatos={setDatos} disabled={e.enviando} />
      {e.error && <Aviso tono="error">{e.error}</Aviso>}
      <button type="submit" className="px-btn shine" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }} disabled={e.enviando}>
        {e.enviando ? "Creando Snowville…" : "Crear temporada"}
      </button>
    </form>
  );
}

export function EnlaceInvitacion({ codigo, compacto }: { codigo: string; compacto?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const origen = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const url = `${origen}/i/${codigo}`;
  const texto = `🎄 Te invito a Los Juegos del Regalo: Christmas Chaos. Entra aquí y crea tu personaje: ${url}`;
  return (
    <div className="flex flex-col gap-3">
      {!compacto && <Aviso tono="ok">¡Temporada creada! Comparte este enlace con tus amigos por WhatsApp.</Aviso>}
      <div className="px-box break-all px-3 py-2 font-mono text-[0.85rem]" style={{ ["--bg" as string]: "#fff" }}>
        {url}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-btn flex-1 !min-h-[44px] !text-[0.9rem]"
          style={{ ["--bg" as string]: "var(--gold)" }}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2000);
            } catch {}
          }}
        >
          {copiado ? "¡Copiado!" : "Copiar enlace"}
        </button>
        <a
          className="px-btn flex-1 !min-h-[44px] !text-[0.9rem]"
          style={{ ["--bg" as string]: "var(--mint)" }}
          href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
      {!compacto && (
        <button type="button" onClick={irALaPlaza} className="px-btn" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
          Ir a la plaza →
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ unirse
export function UnirseForm({ codigo, temporada }: { codigo: string; temporada: string }) {
  const [datos, setDatos] = useState<DatosForm>(DATOS_INICIALES);
  const [listo, setListo] = useState<string | null>(null);
  const e = useEnvio();

  if (listo) {
    return (
      <div className="flex flex-col gap-3">
        <Aviso tono="ok">
          ¡Listo! Ya eres parte de <b>{temporada}</b>. El organizador tiene que aprobarte para que puedas sumar puntos.
        </Aviso>
        <div className="px-box px-3 py-2" style={{ ["--bg" as string]: "var(--cream-2)" }}>
          <p className="px-hint">Para entrar desde otro celular:</p>
          <p className="font-pixel">
            Usuario: <span className="text-[var(--cherry)]">{listo}</span> + tu PIN
          </p>
        </div>
        <button type="button" onClick={irALaPlaza} className="px-btn" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
          Ir a la plaza →
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (ev) => {
        ev.preventDefault();
        const local = errorLocal(datos);
        if (local) return e.setError(local);
        e.setEnviando(true);
        e.setError(null);
        const r = await api<{ username: string }>("/api/unirse", { body: { codigo, ...datos } });
        e.setEnviando(false);
        if (r.ok) setListo(r.username);
        else e.setError(r.error);
      }}
    >
      <CamposJugador datos={datos} setDatos={setDatos} disabled={e.enviando} />
      {e.error && <Aviso tono="error">{e.error}</Aviso>}
      <button type="submit" className="px-btn shine" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }} disabled={e.enviando}>
        {e.enviando ? "Creando tu personaje…" : "Entrar a Snowville"}
      </button>
      <p className="px-hint text-center">
        ¿Ya te registraste antes?{" "}
        <Link href="/entrar" className="underline">
          Entra con tu usuario y PIN
        </Link>
      </p>
    </form>
  );
}

// ------------------------------------------------------------------ entrar
export function EntrarForm() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const e = useEnvio();
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (ev) => {
        ev.preventDefault();
        if (username.trim().length < 3 || !/^\d{4}$/.test(pin)) return e.setError("Escribe tu usuario y tu PIN de 4 números.");
        e.setEnviando(true);
        e.setError(null);
        const r = await api("/api/entrar", { body: { username, pin } });
        if (r.ok) return irALaPlaza();
        e.setEnviando(false);
        e.setError(r.error);
        setPin("");
      }}
    >
      <div>
        <label className="px-label" htmlFor="u">
          Usuario
        </label>
        <input
          id="u"
          className="px-input"
          value={username}
          onChange={(ev) => setUsername(ev.target.value.toLowerCase().replace(/\s/g, "_"))}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="username"
          maxLength={20}
          disabled={e.enviando}
          required
        />
      </div>
      <div>
        <label className="px-label" htmlFor="p">
          PIN
        </label>
        <input
          id="p"
          className="px-input pin"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          value={pin}
          onChange={(ev) => setPin(ev.target.value.replace(/\D/g, "").slice(0, 4))}
          autoComplete="current-password"
          disabled={e.enviando}
          required
        />
      </div>
      {e.error && <Aviso tono="error">{e.error}</Aviso>}
      <button type="submit" className="px-btn shine" style={{ ["--bg" as string]: "var(--gold)" }} disabled={e.enviando}>
        {e.enviando ? "Entrando…" : "Entrar"}
      </button>
      <p className="px-hint text-center">¿Olvidaste tu PIN? Pídele al organizador que te lo reinicie desde su panel.</p>
    </form>
  );
}
