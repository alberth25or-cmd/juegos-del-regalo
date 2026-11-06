"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { EMOTES, FRASES_RAPIDAS, MAX_CHAT } from "@/features/contenido/filtro";
import { contextoDelDia, fraseDe, NPCS, type NpcId } from "@/features/contenido/npcs";
import { sala as salaPorId, type Interaccion, type SalaId } from "@/features/mundo/mapas";
import { Avatar } from "@/components/rpg/PixelSprite";
import { Retrato } from "@/components/rpg/Retrato";
import { api } from "@/lib/cliente/api";
import { limpiarArte, precargarImagenes } from "./arte";
import { Motor, type Accion } from "./motor";
import { crearRed, topico, type EstadoRed, type Evento, type Presencia, type Red } from "./red";

export interface JugadorMundo {
  id: string;
  nombre: string;
  avatar: unknown;
  color: string | null;
  pendiente: boolean;
  seasonId: string;
  dia: number;
  prueba?: boolean;
  admin?: boolean;
}

interface MensajeLog {
  id: string;
  playerId: string;
  nombre: string;
  texto: string;
  fecha: string;
}

interface PerfilVista {
  id: string;
  nombre: string;
  avatar: unknown;
  pendiente: boolean;
  equipo: { nombre: string; color: string; emblema: string } | null;
  puntos: number;
  nivel: number;
}

type Hoja =
  | { tipo: "interaccion"; i: Interaccion }
  | { tipo: "npc"; npc: NpcId; lineas: string[] }
  | { tipo: "jugador"; id: string; nombre: string; perfil?: PerfilVista | null }
  | { tipo: "aqui" }
  | { tipo: "menu" }
  | null;

const CLAVE_POS = "jdr:mundo-pos";
const CLAVE_AYUDA = "jdr:instrucciones-v1";

function leerPos(): { sala: SalaId; x: number; y: number } | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(CLAVE_POS) ?? "null");
    return v && typeof v.x === "number" ? v : null;
  } catch {
    return null;
  }
}
function guardarPos(sala: SalaId, x: number, y: number) {
  try {
    sessionStorage.setItem(CLAVE_POS, JSON.stringify({ sala, x, y }));
  } catch {}
}

const ESTADO_RED: Record<EstadoRed, { t: string; c: string }> = {
  conectando: { t: "Conectando…", c: "#f6b93b" },
  "en-vivo": { t: "En vivo", c: "#2ecc71" },
  reconectando: { t: "Reconectando…", c: "#f6b93b" },
  local: { t: "Modo local", c: "#57b9f0" },
  "sin-red": { t: "Solo tú", c: "#b8b8c8" },
};

export function Mundo({ jugador, realtime, salaInicial }: { jugador: JugadorMundo | null; realtime: { url: string; key: string } | null; salaInicial: SalaId }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const motor = useRef<Motor | null>(null);
  const red = useRef<Red | null>(null);
  const salaRef = useRef<SalaId>(salaInicial);
  const [sala, setSala] = useState<SalaId>(salaInicial);
  const [estado, setEstado] = useState<EstadoRed>(jugador ? "conectando" : "sin-red");
  const [aqui, setAqui] = useState<{ id: string; nombre: string }[]>([]);
  const [hoja, setHoja] = useState<Hoja>(null);
  const [panel, setPanel] = useState<"emotes" | "frases" | "chat" | null>(null);
  const [texto, setTexto] = useState("");
  const [log, setLog] = useState<MensajeLog[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [ayuda, setAyuda] = useState(false);
  const [listo, setListo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const yoId = jugador?.id ?? "visitante";

  const avisar = useCallback((t: string) => {
    setToast(t);
    window.setTimeout(() => setToast((x) => (x === t ? null : x)), 3200);
  }, []);

  const presencia = useCallback(
    (x: number, y: number): Presencia => ({ id: yoId, nombre: jugador?.nombre ?? "Visitante", avatar: jugador?.avatar, color: jugador?.color ?? null, x, y, pendiente: jugador?.pendiente }),
    [jugador, yoId],
  );

  const agregarLog = useCallback((m: MensajeLog) => {
    setLog((l) => (l.some((x) => x.id === m.id) ? l : [...l.slice(-19), m]));
  }, []);

  const cargarChat = useCallback(
    async (s: SalaId) => {
      if (!jugador) return;
      const r = await api<{ mensajes: MensajeLog[] }>(`/api/mundo/chat?sala=${s}`, { intentos: 1, tope: 8000 });
      if (r.ok && salaRef.current === s) setLog(r.mensajes);
    },
    [jugador],
  );

  // ------------------------------------------------------------ montaje
  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return;
    let vivo = true;
    const guardada = leerPos();
    const inicio = guardada && guardada.sala === salaInicial ? { x: guardada.x, y: guardada.y } : undefined;
    const r = crearRed(realtime, !!jugador);
    red.current = r;

    void precargarImagenes().then(() => {
      if (!vivo) return;
      limpiarArte();
      const m = new Motor(
        canvas,
        {
          alMoverme: (de, a) => {
            if (jugador) r.enviar({ tipo: "mover", id: yoId, de, a });
          },
          alDetenerme: (p) => {
            r.actualizar(presencia(p.x, p.y));
            guardarPos(salaRef.current, p.x, p.y);
          },
          alCambiarSala: (destino, llegada) => {
            m.entrar(destino, llegada);
            salaRef.current = destino;
            setSala(destino);
            setLog([]);
            setHoja(null);
            guardarPos(destino, llegada.x, llegada.y);
            const url = new URL(window.location.href);
            url.searchParams.set("sala", destino);
            window.history.replaceState(null, "", url);
            if (jugador) r.unir(topico(jugador.seasonId, destino), presencia(llegada.x, llegada.y));
            void cargarChat(destino);
          },
          alAccion: (a: Accion) => {
            if (a.tipo === "interaccion" && a.objeto.interaccion) setHoja({ tipo: "interaccion", i: a.objeto.interaccion });
            else if (a.tipo === "npc") {
              const ctx = contextoDelDia(jugador?.dia ?? 0);
              const semilla = Math.floor(Date.now() / 60000);
              const lineas = [fraseDe(a.npc, "general", semilla), fraseDe(a.npc, ctx, semilla + 3), fraseDe(a.npc, "general", semilla + 11)].filter((v, i, arr) => arr.indexOf(v) === i);
              setHoja({ tipo: "npc", npc: a.npc, lineas });
            } else if (a.tipo === "jugador") {
              setHoja({ tipo: "jugador", id: a.id, nombre: a.nombre });
              void api<{ perfil: PerfilVista }>(`/api/jugadores/${a.id}`, { intentos: 2, tope: 8000 }).then((res) =>
                setHoja((h) => (h?.tipo === "jugador" && h.id === a.id ? { ...h, perfil: res.ok ? res.perfil : null } : h)),
              );
            }
          },
        },
        { id: yoId, nombre: jugador?.nombre ?? "Visitante", avatar: jugador?.avatar, color: jugador?.color ?? null, pendiente: jugador?.pendiente },
        salaInicial,
        inicio,
      );
      m.ligero = document.documentElement.dataset.ligero === "1";
      motor.current = m;
      // Solo en desarrollo: acceso para pruebas automáticas.
      if (process.env.NODE_ENV !== "production") (window as unknown as { __motor: Motor }).__motor = m;
      m.medir();
      m.iniciar();
      setListo(true);
      try {
        if (localStorage.getItem(CLAVE_AYUDA) !== "1") setAyuda(true);
      } catch {}

      r.alEstado(setEstado);
      r.alPresencia((lista) => {
        m.sincronizar(lista);
        setAqui(m.listaAqui());
      });
      r.alEvento((e: Evento) => {
        if (e.tipo === "mover") m.moverOtro(e.id, e.de, e.a);
        else if (e.tipo === "emote") m.burbuja(e.id, e.emote, "emote");
        else if (e.tipo === "frase") m.burbuja(e.id, e.texto, "chat");
        else if (e.tipo === "saludo" && e.para === yoId) {
          m.burbuja(e.id, "👋", "emote");
          avisar(`${e.nombre} te saludó 👋`);
        } else if (e.tipo === "chat") {
          m.burbuja(e.playerId, e.texto, "chat");
          agregarLog({ id: e.id, playerId: e.playerId, nombre: e.nombre, texto: e.texto, fecha: e.fecha });
        }
      });
      if (jugador) {
        const p = inicio ?? salaPorId(salaInicial).inicio;
        r.unir(topico(jugador.seasonId, salaInicial), presencia(p.x, p.y));
        void cargarChat(salaInicial);
      }
    });

    const ro = new ResizeObserver(() => motor.current?.medir());
    ro.observe(canvas);
    const ligero = () => motor.current && (motor.current.ligero = document.documentElement.dataset.ligero === "1");
    window.addEventListener("ligero-cambio", ligero);
    return () => {
      vivo = false;
      ro.disconnect();
      window.removeEventListener("ligero-cambio", ligero);
      motor.current?.detener();
      motor.current = null;
      r.cerrar();
    };
    // Se monta una sola vez: la sala cambia dentro del motor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tocar el mundo
  const alTocar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!motor.current) return;
    setPanel(null);
    motor.current.tocar(e.clientX, e.clientY);
  };

  // ------------------------------------------------------------ acciones
  const emote = (em: string) => {
    motor.current?.burbuja(yoId, em, "emote");
    red.current?.enviar({ tipo: "emote", id: yoId, emote: em });
    setPanel(null);
  };
  const frase = (f: string) => {
    motor.current?.burbuja(yoId, f, "chat");
    red.current?.enviar({ tipo: "frase", id: yoId, texto: f });
    setPanel(null);
  };
  const enviarChat = async () => {
    const t = texto.trim();
    if (!t || !jugador) return;
    setEnviando(true);
    const r = await api<{ mensaje: MensajeLog; difundido: boolean }>("/api/mundo/chat", { body: { sala: salaRef.current, texto: t } });
    setEnviando(false);
    if (!r.ok) return avisar(r.error);
    setTexto("");
    setPanel(null);
    motor.current?.burbuja(yoId, r.mensaje.texto, "chat");
    agregarLog(r.mensaje);
    if (!r.difundido) red.current?.enviar({ tipo: "chat", ...r.mensaje });
  };
  const reportar = async (tipo: "message" | "player", id: string) => {
    const motivo = window.prompt("¿Qué pasó? (lo verá solo el organizador)");
    if (motivo === null) return;
    const r = await api("/api/mundo/reportar", { body: { tipo, id, motivo } });
    avisar(r.ok ? "Gracias. El organizador lo revisará." : r.error);
  };

  const s = salaPorId(sala);
  const est = ESTADO_RED[estado];
  const recientes = log.slice(-3);

  return (
    <div className="fixed inset-0 z-0 select-none overflow-hidden bg-[#1b1730]" style={{ touchAction: "none" }}>
      <canvas ref={lienzo} className="block h-full w-full" onPointerDown={alTocar} aria-label={`${s.nombre}: toca el suelo para caminar, toca una puerta para entrar`} />

      {!listo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-pixel text-lg text-[var(--cream)]" style={{ animation: "glow-pulse 1.2s steps(3) infinite" }}>
            Abriendo Snowville…
          </p>
        </div>
      )}

      {/* Barra superior */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <button type="button" className="px-btn !min-h-[40px] !px-3 !text-[0.9rem]" style={{ ["--bg" as string]: "var(--cream)" }} onClick={() => setHoja({ tipo: "menu" })} aria-label="Abrir menú">
              ☰ Menú
            </button>
            <button type="button" className="px-btn !min-h-[40px] !px-3 !text-[0.9rem]" style={{ ["--bg" as string]: "var(--gold)" }} onClick={() => setAyuda(true)} aria-label="Cómo se juega">
              ?
            </button>
          </div>
          <span className="px-chip !text-[0.85rem]" style={{ ["--chip" as string]: "var(--cream)" }}>
            📍 {s.nombre}
          </span>
          {jugador?.prueba && (
            <span className="px-chip !text-[0.72rem]" style={{ ["--chip" as string]: "var(--lavender)" }}>
              🧪 Prueba · día {jugador.dia || 1}
            </span>
          )}
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <span className="px-chip !text-[0.72rem]" title="Estado de la conexión en vivo">
            <span className="inline-block h-2 w-2" style={{ background: est.c, boxShadow: "0 0 0 1px #2a2342" }} /> {est.t}
          </span>
          {jugador && (
            <button type="button" className="px-chip !text-[0.8rem]" style={{ ["--chip" as string]: "var(--gold)" }} onClick={() => setHoja({ tipo: "aqui" })}>
              👥 {aqui.length + 1} aquí
            </button>
          )}
        </div>
      </div>

      {/* Chat reciente */}
      {recientes.length > 0 && (
        <ul className="pointer-events-none absolute left-3 top-[108px] flex max-w-[70%] flex-col gap-1">
          {recientes.map((m) => (
            <li key={m.id} className="pointer-events-auto">
              <button type="button" onClick={() => m.playerId !== yoId && reportar("message", m.id)} className="rounded-sm bg-[rgb(27_31_74/0.72)] px-2 py-0.5 text-left text-[0.78rem] text-[var(--cream)]">
                <b className="font-pixel">{m.playerId === yoId ? "Tú" : m.nombre}:</b> {m.texto}
              </button>
            </li>
          ))}
        </ul>
      )}

      {ayuda && listo && (
        <Instrucciones
          visitante={!jugador}
          onCerrar={() => {
            setAyuda(false);
            try {
              localStorage.setItem(CLAVE_AYUDA, "1");
            } catch {}
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center px-6">
          <p className="px-box anim-pop px-4 py-2 text-[0.9rem]" style={{ ["--bg" as string]: "var(--mint)" }}>
            {toast}
          </p>
        </div>
      )}

      {/* Visitante */}
      {!jugador && listo && (
        <div className="absolute inset-x-0 flex justify-center px-4" style={{ bottom: "calc(max(12px, env(safe-area-inset-bottom)) + 4px)" }}>
          <div className="px-box flex max-w-md items-center gap-3 px-3 py-2">
            <span className="min-w-0 flex-1 text-[0.85rem] leading-tight">
              <b className="font-pixel">Estás de visita.</b> Con tu invitación, tus amigos te verán caminar en vivo.
            </span>
            <Link href="/entrar" className="px-btn !min-h-[40px] !px-3 !text-[0.85rem]" style={{ ["--bg" as string]: "var(--gold)" }}>
              Entrar
            </Link>
          </div>
        </div>
      )}

      {/* Acciones */}
      {jugador && !hoja && (
        <div className="absolute inset-x-0 flex flex-col items-center gap-2 px-3" style={{ bottom: "calc(max(12px, env(safe-area-inset-bottom)) + 4px)" }}>
          {panel === "emotes" && (
            <div className="px-box anim-pop grid grid-cols-5 gap-1 p-2">
              {EMOTES.map((em) => (
                <button key={em} type="button" className="h-11 w-11 text-2xl active:scale-90" onClick={() => emote(em)} aria-label={`Emote ${em}`}>
                  {em}
                </button>
              ))}
            </div>
          )}
          {panel === "frases" && (
            <div className="px-box anim-pop flex max-h-[38svh] w-full max-w-sm flex-col gap-1 overflow-y-auto p-2">
              {FRASES_RAPIDAS.map((f) => (
                <button key={f} type="button" className="px-2 py-2 text-left text-[0.88rem] hover:bg-[var(--cream-2)]" onClick={() => frase(f)}>
                  {f}
                </button>
              ))}
            </div>
          )}
          {panel === "chat" && (
            <form
              className="px-box anim-pop flex w-full max-w-sm gap-2 p-2"
              onSubmit={(e) => {
                e.preventDefault();
                void enviarChat();
              }}
            >
              <input
                autoFocus
                className="px-input !min-h-[42px] flex-1 !py-1"
                maxLength={MAX_CHAT}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Mensaje corto (60 letras)"
                aria-label="Mensaje para la sala"
                disabled={enviando}
              />
              <button type="submit" className="px-btn !min-h-[42px] !px-3" style={{ ["--bg" as string]: "var(--gold)" }} disabled={enviando || !texto.trim()}>
                {enviando ? "…" : "Enviar"}
              </button>
            </form>
          )}
          <div className="flex gap-2">
            {(
              [
                ["emotes", "😀", "Emotes"],
                ["frases", "💬", "Frases"],
                ["chat", "⌨️", "Escribir"],
              ] as const
            ).map(([k, e, t]) => (
              <button
                key={k}
                type="button"
                onClick={() => setPanel((p) => (p === k ? null : k))}
                className="px-btn !min-h-[44px] !gap-1 !px-3 !text-[0.85rem]"
                style={{ ["--bg" as string]: panel === k ? "var(--gold)" : "var(--cream)" }}
                aria-pressed={panel === k}
              >
                <span aria-hidden>{e}</span> {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hojas */}
      {hoja && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-[rgb(27_31_74/0.45)] px-3" style={{ paddingBottom: "calc(max(12px, env(safe-area-inset-bottom)) + 8px)" }} onPointerDown={(e) => e.target === e.currentTarget && setHoja(null)}>
          <div className="px-box anim-pop w-full max-w-md p-4" role="dialog" aria-modal="true">
            {hoja.tipo === "interaccion" && (
              <div className="flex flex-col gap-3">
                <p className="font-pixel text-xl">{hoja.i.titulo}</p>
                <p className="text-[0.92rem]">{hoja.i.texto}</p>
                {hoja.i.href ? (
                  <Link href={hoja.i.href} className="px-btn shine" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
                    ▶ {hoja.i.href.startsWith("/arcade") ? "Jugar" : "Abrir"}
                  </Link>
                ) : (
                  <span className="px-chip self-start" style={{ ["--chip" as string]: "var(--lavender)" }}>
                    🔧 Próximamente: lo estamos construyendo
                  </span>
                )}
              </div>
            )}
            {hoja.tipo === "npc" && <DialogoNpcUnico npc={hoja.npc} lineas={hoja.lineas} onCerrar={() => setHoja(null)} />}
            {hoja.tipo === "jugador" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-20 w-16 items-end justify-center bg-[var(--sky)]" style={{ boxShadow: "0 0 0 2px var(--ink)" }}>
                    {hoja.perfil ? <Avatar config={hoja.perfil.avatar} size={46} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-pixel text-xl">{hoja.nombre}</p>
                    {hoja.perfil === undefined && <p className="px-hint">Cargando…</p>}
                    {hoja.perfil === null && <p className="px-hint">No se pudo cargar su perfil.</p>}
                    {hoja.perfil && (
                      <div className="mt-1 flex flex-wrap gap-1 text-[0.75rem]">
                        <span className="px-chip">Nv. {hoja.perfil.nivel}</span>
                        <span className="px-chip" style={{ ["--chip" as string]: "var(--gold)" }}>
                          ⭐ {hoja.perfil.puntos}
                        </span>
                        {hoja.perfil.equipo ? (
                          <span className="px-chip" style={{ ["--chip" as string]: hoja.perfil.equipo.color, color: "#fff" }}>
                            {hoja.perfil.equipo.emblema} {hoja.perfil.equipo.nombre}
                          </span>
                        ) : (
                          <span className="px-chip">{hoja.perfil.pendiente ? "Esperando aprobación" : "Sin equipo"}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-btn flex-1"
                    style={{ ["--bg" as string]: "var(--gold)" }}
                    onClick={() => {
                      red.current?.enviar({ tipo: "saludo", id: yoId, para: hoja.id, nombre: jugador?.nombre ?? "Alguien" });
                      motor.current?.burbuja(yoId, "👋", "emote");
                      setHoja(null);
                    }}
                  >
                    👋 Saludar
                  </button>
                  <button type="button" className="px-btn !px-3" disabled title="Próximamente, con la Arena">
                    ⚔️ Retar
                  </button>
                </div>
                <button type="button" className="self-start text-[0.8rem] underline" onClick={() => reportar("player", hoja.id)}>
                  Reportar
                </button>
              </div>
            )}
            {hoja.tipo === "menu" && <Menu admin={!!jugador?.admin} visitante={!jugador} onAyuda={() => { setHoja(null); setAyuda(true); }} />}
            {hoja.tipo === "aqui" && (
              <div className="flex flex-col gap-2">
                <p className="font-pixel text-xl">En {s.nombre}</p>
                <ul className="flex flex-col gap-1">
                  <li className="text-[0.9rem]">⭐ Tú</li>
                  {aqui.map((p) => (
                    <li key={p.id}>
                      <button type="button" className="text-[0.9rem] underline" onClick={() => setHoja({ tipo: "jugador", id: p.id, nombre: p.nombre })}>
                        {p.nombre}
                      </button>
                    </li>
                  ))}
                </ul>
                {aqui.length === 0 && <p className="px-hint">Por ahora estás solo aquí. Prueba en la plaza.</p>}
              </div>
            )}
            {hoja.tipo !== "npc" && (
              <button type="button" className="mt-3 w-full text-[0.85rem] underline" onClick={() => setHoja(null)}>
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DialogoNpcUnico({ npc, lineas, onCerrar }: { npc: NpcId; lineas: string[]; onCerrar: () => void }) {
  const [i, setI] = useState(0);
  const n = NPCS[npc];
  return (
    <button type="button" className="flex w-full items-end gap-3 text-left" onClick={() => (i + 1 < lineas.length ? setI(i + 1) : onCerrar())}>
      <span className="shrink-0 self-end overflow-hidden" style={{ boxShadow: "0 0 0 3px var(--ink)", background: n.color }}>
        <Retrato npc={npc} size={96} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-pixel text-lg" style={{ color: n.color }}>
          {n.nombre}
        </span>
        <span className="block text-[0.7rem] text-[var(--ink-soft)]">{n.cargo}</span>
        <span key={i} className="anim-pop mt-1 block text-[0.95rem] leading-snug">
          {lineas[i]}
        </span>
        <span className="mt-1 block text-right font-pixel text-[0.75rem]">{i + 1 < lineas.length ? "▼ seguir" : "✕ cerrar"}</span>
      </span>
    </button>
  );
}

function Menu({ admin, visitante, onAyuda }: { admin: boolean; visitante: boolean; onAyuda: () => void }) {
  const items: [string, string, string][] = visitante
    ? [
        ["🔑", "Entrar con mi usuario", "/entrar"],
        ["🎄", "Crear una temporada", "/crear"],
        ["📜", "Reglas y privacidad", "/reglas"],
      ]
    : [
        ["🏆", "Ranking", "/ranking"],
        ["📰", "Noticias y mi progreso", "/plaza"],
        ["👤", "Mi perfil y mi personaje", "/perfil"],
        ...(admin ? ([["⚙️", "Panel del organizador", "/admin"]] as [string, string, string][]) : []),
        ["📜", "Reglas y privacidad", "/reglas"],
      ];
  return (
    <nav className="flex flex-col gap-2" aria-label="Menú">
      <p className="font-pixel text-xl">Menú</p>
      {items.map(([e, t, href]) => (
        <Link key={href} href={href} className="px-box flex items-center gap-3 px-3 py-2.5" style={{ ["--bg" as string]: "#fff", margin: "2px 0" }}>
          <span className="text-xl" aria-hidden>
            {e}
          </span>
          <span className="font-pixel">{t}</span>
        </Link>
      ))}
      <button type="button" className="px-box flex items-center gap-3 px-3 py-2.5 text-left" style={{ ["--bg" as string]: "var(--cream-2)", margin: "2px 0" }} onClick={onAyuda}>
        <span className="text-xl" aria-hidden>
          📖
        </span>
        <span className="font-pixel">Cómo se juega</span>
      </button>
    </nav>
  );
}

const PASOS: { e: string; t: string; d: string }[] = [
  { e: "👆", t: "Camina", d: "Toca el suelo y tu personaje va solo hasta ahí." },
  { e: "🚪", t: "Entra a las casas", d: "Toca una casa o su puerta. Adentro también caminas; sales por la puerta de abajo." },
  { e: "💬", t: "Habla y saluda", d: "Toca a un personaje para hablar. Toca a un amigo para ver su perfil y saludarlo." },
  { e: "▶", t: "Juega", d: "Lo que tiene ▶ se juega (empieza por la máquina del Arcade). Lo que tiene ! te cuenta qué viene." },
  { e: "☰", t: "Menú", d: "Ranking, noticias, tu perfil y, si organizas, el panel." },
];

function Instrucciones({ visitante, onCerrar }: { visitante: boolean; onCerrar: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgb(27_31_74/0.6)] px-4" role="dialog" aria-modal="true" aria-labelledby="instr-titulo">
      <div className="px-box anim-pop w-full max-w-sm p-5">
        <h2 id="instr-titulo" className="font-pixel text-[1.6rem] leading-tight">
          Cómo se juega
        </h2>
        <p className="px-hint">Snowville está en quiebra. Ayuda (o no) a salvar la Navidad.</p>
        <ol className="mt-3 flex flex-col gap-2">
          {PASOS.map((p) => (
            <li key={p.t} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--cream-2)] font-pixel text-lg" style={{ boxShadow: "0 0 0 2px var(--ink)" }} aria-hidden>
                {p.e}
              </span>
              <span className="leading-snug">
                <span className="block font-pixel">{p.t}</span>
                <span className="block text-[0.85rem] text-[var(--ink-soft)]">{p.d}</span>
              </span>
            </li>
          ))}
        </ol>
        {visitante && <p className="mt-3 rounded-sm bg-[var(--cream-2)] px-3 py-2 text-[0.82rem]">Estás de visita: puedes pasear, pero para jugar y que te vean tus amigos necesitas entrar con tu usuario.</p>}
        <button type="button" className="px-btn shine mt-4 w-full" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }} onClick={onCerrar}>
          ¡A jugar!
        </button>
      </div>
    </div>
  );
}
