"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DURACION_MS, OBJETOS, generarLluvia, multiplicador, puntuar, type Caida } from "@/features/games/giftCatcher";
import { GIFT_CATCHER, monedasDelDia } from "@/features/scoring/reglas";
import { fraseDe } from "@/features/contenido/npcs";
import { avatarValido } from "@/features/avatar";
import { avatarSprite, type SpriteDef } from "@/components/rpg/sprites";
import { NpcSprite } from "@/components/rpg/PixelSprite";
import { api } from "@/lib/cliente/api";
import { OBJETO_SPRITES } from "./giftSprites";

export interface StatsGift {
  record: number;
  mejorHoy: number;
  monedasHoy: number;
}

interface Resultado {
  valida: boolean;
  motivo?: string;
  puntaje: number;
  mejorDelDia: number;
  record: number;
  monedas: number;
  monedasHoy: number;
  topeHoy: number;
  pretemporada: boolean;
  atrapados?: Record<string, number>;
  rachaMax?: number;
}

type Fase = "inicio" | "preparando" | "cuenta" | "jugando" | "pausa" | "enviando" | "resultado";

// ---------------------------------------------------------------- dibujo
function spriteACanvas(def: SpriteDef, px: number): HTMLCanvasElement {
  const { rows, colors } = def;
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const lleno = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < (rows[y]?.length ?? 0) && rows[y][x] !== "." && !!colors[rows[y][x]];
  const c = document.createElement("canvas");
  c.width = (w + 2) * px;
  c.height = (h + 2) * px;
  const g = c.getContext("2d")!;
  for (let y = -1; y <= h; y++) {
    for (let x = -1; x <= w; x++) {
      let color: string | null = null;
      if (lleno(x, y)) color = colors[rows[y][x]];
      else if (lleno(x + 1, y) || lleno(x - 1, y) || lleno(x, y + 1) || lleno(x, y - 1)) color = "#2a2342";
      if (color) {
        g.fillStyle = color;
        g.fillRect((x + 1) * px, (y + 1) * px, px, px);
      }
    }
  }
  return c;
}

interface Particula {
  x: number;
  y: number;
  vy: number;
  vida: number;
  texto: string;
  color: string;
}

interface Motor {
  lluvia: Caida[];
  llegada: number[];
  t: number;
  siguiente: number;
  activos: number[];
  atrapados: number[];
  resueltos: Set<number>;
  x: number;
  objetivo: number | null;
  dir: number;
  aturdido: number;
  particulas: Particula[];
  copos: { x: number; y: number; v: number; r: number }[];
  ultimo: number;
  puntaje: number;
  racha: number;
}

const ANCHO_JUGADOR = 0.17;
const TAM_OBJETO = 0.095;

export function GiftCatcher({
  modo,
  aviso,
  avatar,
  stats,
  pretemporada,
}: {
  /** "real": partida validada por el servidor. "practica": no se guarda. */
  modo: "real" | "practica";
  aviso?: string;
  avatar: unknown;
  stats: StatsGift | null;
  pretemporada: boolean;
}) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [error, setError] = useState<string | null>(null);
  const [cuenta, setCuenta] = useState(3);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [final, setFinal] = useState<{ puntaje: number; atrapados: Record<string, number>; rachaMax: number } | null>(null);
  const [misStats, setMisStats] = useState(stats);

  const lienzo = useRef<HTMLCanvasElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const hudPuntos = useRef<HTMLSpanElement>(null);
  const hudTiempo = useRef<HTMLSpanElement>(null);
  const hudCombo = useRef<HTMLSpanElement>(null);
  const motor = useRef<Motor | null>(null);
  const partida = useRef<{ id: string | null; seed: number }>({ id: null, seed: 1 });
  const raf = useRef(0);
  const faseRef = useRef<Fase>("inicio");
  const sprites = useRef<{ jugador: HTMLCanvasElement; objetos: Record<string, HTMLCanvasElement>; fondo: HTMLCanvasElement | null; px: number } | null>(null);

  const cambiarFase = useCallback((f: Fase) => {
    faseRef.current = f;
    setFase(f);
  }, []);

  // ------------------------------------------------------------- empezar
  const empezar = useCallback(async () => {
    setError(null);
    setResultado(null);
    setFinal(null);
    cambiarFase("preparando");
    if (modo === "real") {
      const r = await api<{ attemptId: string; seed: number }>("/api/partidas", { body: {} });
      if (!r.ok) {
        setError(r.error);
        cambiarFase("inicio");
        return;
      }
      partida.current = { id: r.attemptId, seed: r.seed };
    } else {
      partida.current = { id: null, seed: Math.floor(Math.random() * 2 ** 31) };
    }
    const lluvia = generarLluvia(partida.current.seed);
    motor.current = {
      lluvia,
      llegada: lluvia.map((c) => c.t + c.caida),
      t: 0,
      siguiente: 0,
      activos: [],
      atrapados: [],
      resueltos: new Set(),
      x: 0.5,
      objetivo: null,
      dir: 0,
      aturdido: 0,
      particulas: [],
      copos: Array.from({ length: 36 }, () => ({ x: Math.random(), y: Math.random(), v: 0.03 + Math.random() * 0.06, r: Math.random() < 0.3 ? 2 : 1 })),
      ultimo: 0,
      puntaje: 0,
      racha: 0,
    };
    setCuenta(3);
    cambiarFase("cuenta");
  }, [modo, cambiarFase]);

  // Cuenta regresiva 3-2-1-¡YA!
  useEffect(() => {
    if (fase !== "cuenta") return;
    const t = window.setTimeout(
      () => {
        if (cuenta > 0) return setCuenta((c) => c - 1);
        if (motor.current) motor.current.ultimo = performance.now();
        cambiarFase("jugando");
      },
      cuenta > 0 ? 650 : 450,
    );
    return () => window.clearTimeout(t);
  }, [fase, cuenta, cambiarFase]);

  // ---------------------------------------------------------- terminar
  const terminar = useCallback(async () => {
    const m = motor.current;
    if (!m) return;
    cancelAnimationFrame(raf.current);
    const r = puntuar(m.lluvia, m.atrapados);
    setFinal({ puntaje: r.puntaje, atrapados: r.atrapados, rachaMax: r.rachaMax });
    if (modo === "practica" || !partida.current.id) {
      cambiarFase("resultado");
      return;
    }
    cambiarFase("enviando");
    const id = partida.current.id;
    const resp = await api<{ resultado: Resultado }>(`/api/partidas/${id}`, {
      body: { puntaje: r.puntaje, duracionMs: Math.round(m.t), atrapados: m.atrapados },
      idempotente: true,
      intentos: 4,
      tope: 15_000,
    });
    if (resp.ok) {
      setResultado(resp.resultado);
      setMisStats({ record: resp.resultado.record, mejorHoy: resp.resultado.mejorDelDia, monedasHoy: resp.resultado.monedasHoy });
    } else if (resp.status === 409) {
      setError("Tu partida ya quedó registrada (se reenvió por mala señal). Revisa tus monedas en el ranking.");
    } else {
      setError(`${resp.error} Tu puntaje: ${r.puntaje}.`);
    }
    cambiarFase("resultado");
  }, [modo, cambiarFase]);

  // -------------------------------------------------------- bucle de juego
  useEffect(() => {
    if (fase !== "jugando" && fase !== "cuenta") return;
    const canvas = lienzo.current;
    const cont = caja.current;
    const m = motor.current;
    if (!canvas || !cont || !m) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;

    const medir = () => {
      W = cont.clientWidth;
      H = cont.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      const px = Math.max(2, Math.round((W * TAM_OBJETO) / 14));
      const pxJ = Math.max(2, Math.round((W * ANCHO_JUGADOR) / 16));
      const objetos: Record<string, HTMLCanvasElement> = {};
      for (const [k, def] of Object.entries(OBJETO_SPRITES)) objetos[k] = spriteACanvas(def, px);
      // Fondo: noche sobre la fábrica en quiebra (se dibuja una vez).
      const fondo = document.createElement("canvas");
      fondo.width = Math.round(W);
      fondo.height = Math.round(H);
      const f = fondo.getContext("2d")!;
      const grad = f.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1b1f4a");
      grad.addColorStop(0.7, "#3b3f7c");
      grad.addColorStop(1, "#6b5fa8");
      f.fillStyle = grad;
      f.fillRect(0, 0, W, H);
      f.fillStyle = "#151838";
      const base = H * 0.86;
      for (let x = 0; x < W; x += W / 7) {
        const alto = H * (0.12 + ((x * 7) % 5) * 0.025);
        f.fillRect(Math.round(x), Math.round(base - alto), Math.round(W / 8), Math.round(alto));
        f.fillRect(Math.round(x + W / 22), Math.round(base - alto - H * 0.05), Math.round(W / 40), Math.round(H * 0.05));
      }
      f.fillStyle = "#f6b93b";
      for (let k = 0; k < 18; k++) f.fillRect(Math.round(((k * 53) % 97) / 97 * W), Math.round(base - H * 0.04 - ((k * 31) % 7) * H * 0.012), 3, 3);
      f.fillStyle = "#fff6e5";
      f.fillRect(0, Math.round(base), Math.round(W), Math.round(H - base));
      f.fillStyle = "#dfe8f5";
      for (let x = 0; x < W; x += 12) f.fillRect(Math.round(x), Math.round(base), 6, 3);
      sprites.current = { jugador: spriteACanvas(avatarSprite(avatarValido(avatar)), pxJ), objetos, fondo, px };
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    const recalcular = () => {
      const visibles = m.lluvia.filter((c) => m.resueltos.has(c.i));
      const r = puntuar(visibles, m.atrapados);
      m.puntaje = r.puntaje;
      // racha actual: regalos seguidos hasta ahora
      let racha = 0;
      const orden = [...visibles].sort((a, b) => a.t + a.caida - (b.t + b.caida));
      for (const c of orden) {
        const bueno = OBJETOS[c.tipo].bueno;
        const at = m.atrapados.includes(c.i);
        if (at && bueno) racha++;
        else if (at || bueno) racha = 0;
      }
      m.racha = racha;
    };

    const paso = (ahora: number) => {
      const s = sprites.current;
      if (!s) return;
      const jugando = faseRef.current === "jugando";
      const dt = jugando ? Math.min(50, ahora - (m.ultimo || ahora)) : 0;
      m.ultimo = ahora;
      if (jugando) m.t += dt;
      const suelo = H * 0.86;
      const anchoJ = s.jugador.width;
      const altoJ = s.jugador.height;

      // Movimiento
      if (jugando && ahora > m.aturdido) {
        const vel = 1.7 * (dt / 1000);
        if (m.dir !== 0) m.x += m.dir * vel;
        else if (m.objetivo !== null) {
          const d = m.objetivo - m.x;
          m.x += Math.sign(d) * Math.min(Math.abs(d), vel * 1.4);
        }
        m.x = Math.max(0.07, Math.min(0.93, m.x));
      }

      // Aparecer objetos
      while (m.siguiente < m.lluvia.length && m.lluvia[m.siguiente].t <= m.t) m.activos.push(m.siguiente++);

      // Atrapar / perder
      let cambio = false;
      const topeJ = suelo - altoJ * 0.85;
      const tam = s.px * 14;
      m.activos = m.activos.filter((i) => {
        const c = m.lluvia[i];
        const p = (m.t - c.t) / c.caida;
        const y = -tam + p * (suelo + tam * 0.2);
        if (y + tam * 0.6 >= topeJ && y <= suelo && ahora > m.aturdido) {
          if (Math.abs(c.x - m.x) * W < anchoJ * 0.5 + tam * 0.35) {
            m.atrapados.push(i);
            m.resueltos.add(i);
            cambio = true;
            const o = OBJETOS[c.tipo];
            const mult = o.bueno ? multiplicador(m.racha) : 1;
            m.particulas.push({ x: c.x * W, y: topeJ, vy: -60, vida: 0.9, texto: o.bueno ? `+${o.valor * mult}` : `${o.valor}`, color: o.bueno ? "#f6b93b" : "#ff8fb0" });
            if (c.tipo === "factura") {
              m.aturdido = ahora + 700;
              try {
                navigator.vibrate?.(60);
              } catch {}
            }
            return false;
          }
        }
        if (p >= 1) {
          m.resueltos.add(i);
          if (OBJETOS[c.tipo].bueno) cambio = true;
          return false;
        }
        return true;
      });
      if (cambio) recalcular();

      // ---- dibujar
      ctx.drawImage(s.fondo!, 0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (const c of m.copos) {
        c.y += c.v * (dt / 1000 || 0.016);
        if (c.y > 1) c.y -= 1;
        ctx.fillRect(Math.round(c.x * W), Math.round(c.y * suelo), c.r * 2, c.r * 2);
      }
      for (const i of m.activos) {
        const c = m.lluvia[i];
        const p = (m.t - c.t) / c.caida;
        const img = s.objetos[c.tipo];
        const y = -tam + p * (suelo + tam * 0.2);
        ctx.drawImage(img, Math.round(c.x * W - img.width / 2), Math.round(y));
      }
      // jugador
      const jx = Math.round(m.x * W - anchoJ / 2);
      const jy = Math.round(suelo - altoJ + 2);
      const temblor = ahora < m.aturdido ? Math.sin(ahora / 30) * 3 : 0;
      ctx.globalAlpha = ahora < m.aturdido ? 0.7 : 1;
      ctx.drawImage(s.jugador, jx + temblor, jy, anchoJ, altoJ);
      ctx.globalAlpha = 1;
      if (ahora < m.aturdido) {
        ctx.font = "bold 16px var(--font-pixelify), monospace";
        ctx.fillStyle = "#fff6e5";
        ctx.textAlign = "center";
        ctx.fillText("¡FACTURA!", m.x * W, jy - 8);
      }
      // partículas de puntos
      ctx.textAlign = "center";
      ctx.font = "bold 18px var(--font-pixelify), monospace";
      m.particulas = m.particulas.filter((q) => {
        q.vida -= (dt || 16) / 1000;
        q.y += q.vy * ((dt || 16) / 1000);
        ctx.globalAlpha = Math.max(0, Math.min(1, q.vida * 1.5));
        ctx.fillStyle = "#2a2342";
        ctx.fillText(q.texto, q.x + 2, q.y + 2);
        ctx.fillStyle = q.color;
        ctx.fillText(q.texto, q.x, q.y);
        return q.vida > 0;
      });
      ctx.globalAlpha = 1;

      // HUD (DOM, sin render de React)
      if (hudPuntos.current) hudPuntos.current.textContent = String(m.puntaje);
      if (hudTiempo.current) hudTiempo.current.textContent = String(Math.max(0, Math.ceil((DURACION_MS - m.t) / 1000)));
      if (hudCombo.current) hudCombo.current.textContent = `x${multiplicador(m.racha)}`;

      if (jugando && m.t >= DURACION_MS) {
        void terminar();
        return;
      }
      raf.current = requestAnimationFrame(paso);
    };
    raf.current = requestAnimationFrame(paso);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, [fase, avatar, terminar]);

  // ------------------------------------------------------------ controles
  useEffect(() => {
    if (fase !== "jugando") return;
    const m = motor.current;
    const canvas = lienzo.current;
    if (!m || !canvas) return;
    const mover = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.objetivo = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    };
    const soltar = () => (m.objetivo = null);
    const tecla = (e: KeyboardEvent, abajo: boolean) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") m.dir = abajo ? -1 : m.dir === -1 ? 0 : m.dir;
      else if (k === "arrowright" || k === "d") m.dir = abajo ? 1 : m.dir === 1 ? 0 : m.dir;
      else if (k === "escape" || k === "p") {
        if (abajo) cambiarFase("pausa");
        return;
      } else return;
      e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => tecla(e, true);
    const ku = (e: KeyboardEvent) => tecla(e, false);
    const oculto = () => document.visibilityState === "hidden" && cambiarFase("pausa");
    canvas.addEventListener("pointerdown", mover);
    canvas.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    document.addEventListener("visibilitychange", oculto);
    return () => {
      canvas.removeEventListener("pointerdown", mover);
      canvas.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      document.removeEventListener("visibilitychange", oculto);
    };
  }, [fase, cambiarFase]);

  // Avisar antes de salir con una partida en curso
  useEffect(() => {
    if (fase !== "jugando" && fase !== "pausa" && fase !== "enviando") return;
    const antes = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", antes);
    return () => window.removeEventListener("beforeunload", antes);
  }, [fase]);

  const enJuego = fase === "cuenta" || fase === "jugando" || fase === "pausa";
  const puntajeFinal = resultado?.puntaje ?? final?.puntaje ?? 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Escenario */}
      <div
        ref={caja}
        className="relative w-full select-none overflow-hidden bg-[#1b1f4a]"
        style={{ height: "min(68svh, 560px)", boxShadow: "0 0 0 3px var(--ink), 0 6px 0 0 var(--ink)", touchAction: "none", display: enJuego ? "block" : "none" }}
      >
        <canvas ref={lienzo} className="block h-full w-full" aria-label="Juego Gift Catcher: mueve el dedo para atrapar regalos" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2 font-pixel text-[var(--cream)]" style={{ textShadow: "0 2px 0 #2a2342" }}>
          <span className="px-chip !text-[0.95rem]" style={{ ["--chip" as string]: "var(--gold)", color: "var(--ink)" }}>
            ⭐ <span ref={hudPuntos}>0</span>
          </span>
          <span className="px-chip !text-[0.85rem]" style={{ ["--chip" as string]: "var(--lavender)", color: "var(--ink)" }}>
            combo <span ref={hudCombo}>x1</span>
          </span>
          <span className="px-chip !text-[0.95rem]" style={{ ["--chip" as string]: "var(--cream)", color: "var(--ink)" }}>
            ⏱ <span ref={hudTiempo}>60</span>
          </span>
        </div>
        {fase === "jugando" && (
          <button type="button" onClick={() => cambiarFase("pausa")} className="px-chip absolute bottom-2 right-2 !text-[0.8rem]" aria-label="Pausar">
            ❚❚ Pausa
          </button>
        )}
        {fase === "cuenta" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgb(27_31_74/0.35)]">
            <span key={cuenta} className="anim-pop font-pixel text-[5rem] text-[var(--gold)]" style={{ textShadow: "0 6px 0 #2a2342" }}>
              {cuenta > 0 ? cuenta : "¡YA!"}
            </span>
          </div>
        )}
        {fase === "pausa" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[rgb(27_31_74/0.75)] p-6 text-center text-[var(--cream)]">
            <span className="font-pixel text-3xl">Pausa</span>
            <p className="text-[0.85rem] opacity-80">El tiempo está detenido. Santa aprovecha para esconderse del banco.</p>
            <button
              type="button"
              className="px-btn"
              style={{ ["--bg" as string]: "var(--gold)", color: "var(--ink)" }}
              onClick={() => {
                if (motor.current) motor.current.ultimo = performance.now();
                cambiarFase("jugando");
              }}
            >
              ▶ Seguir
            </button>
          </div>
        )}
      </div>

      {/* Inicio */}
      {(fase === "inicio" || fase === "preparando") && (
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-3">
            <span className="anim-bob shrink-0">
              <NpcSprite id="santa" size={70} />
            </span>
            <div className="px-box relative flex-1 px-3 py-2 text-[0.9rem]" style={{ ["--bg" as string]: "#fff" }}>
              Los bancos me quitaron todo, menos los regalos. ¡Atrápalos antes de que caigan! Y ni se te ocurra tocar mis facturas.
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-2 text-[0.82rem]">
            {(Object.keys(OBJETOS) as (keyof typeof OBJETOS)[]).map((k) => (
              <li key={k} className="px-box flex items-center gap-2 px-2 py-1.5" style={{ ["--bg" as string]: OBJETOS[k].bueno ? "#fff" : "#fbe9e9", margin: 2 }}>
                <SpriteMini def={OBJETO_SPRITES[k]} />
                <span className="leading-tight">
                  <span className="block font-pixel">{OBJETOS[k].nombre}</span>
                  <span className="block" style={{ color: OBJETOS[k].bueno ? "#1f7a5c" : "#a8243f" }}>
                    {OBJETOS[k].valor > 0 ? `+${OBJETOS[k].valor}` : OBJETOS[k].valor}
                    {k === "factura" ? " y te aturde" : ""}
                  </span>
                </span>
              </li>
            ))}
            <li className="px-box flex items-center px-2 py-1.5 text-[0.78rem] leading-tight" style={{ ["--bg" as string]: "var(--cream-2)", margin: 2 }}>
              5 regalos seguidos = combo x2, 10 = x3
            </li>
          </ul>
          <p className="text-[0.82rem] text-[var(--ink-soft)]">Mueve el dedo sobre el juego (o usa ← → en el teclado). Dura 60 segundos.</p>
          {modo === "real" && misStats && (
            <div className="px-box grid grid-cols-3 gap-1 px-2 py-2 text-center" style={{ ["--bg" as string]: "var(--cream-2)" }}>
              <Dato t="Récord" v={misStats.record} />
              <Dato t="Mejor hoy" v={misStats.mejorHoy} />
              <Dato t="🪙 hoy" v={`${misStats.monedasHoy}/${GIFT_CATCHER.topeDiario}`} />
            </div>
          )}
          {modo === "real" && pretemporada && <p className="px-hint">Pretemporada: puedes practicar; las monedas cuentan desde el 25 de noviembre.</p>}
          {aviso && <p className="px-box px-3 py-2 text-[0.85rem]" style={{ ["--bg" as string]: "var(--cream-2)" }}>{aviso}</p>}
          {error && (
            <p className="px-box px-3 py-2 text-[0.85rem]" role="alert" style={{ ["--bg" as string]: "#f3c9d1" }}>
              {error}
            </p>
          )}
          <button type="button" onClick={empezar} disabled={fase === "preparando"} className="px-btn shine" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
            {fase === "preparando" ? "Preparando la lluvia…" : modo === "real" ? "▶ Jugar" : "▶ Jugar práctica"}
          </button>
        </div>
      )}

      {fase === "enviando" && (
        <div className="px-box p-4 text-center">
          <p className="font-pixel text-lg" style={{ animation: "glow-pulse 1.2s steps(3) infinite" }}>
            El Auditor está revisando tu partida…
          </p>
          <p className="px-hint mt-1">Puntaje: {final?.puntaje ?? 0}</p>
        </div>
      )}

      {/* Resultado */}
      {fase === "resultado" && (
        <div className="flex flex-col gap-3">
          <div className="px-box anim-pop p-4 text-center" style={{ ["--bg" as string]: "#1b1f4a", color: "var(--cream)" }}>
            <p className="font-pixel text-[0.9rem] opacity-80">{resultado && !resultado.valida ? "Partida no válida" : "Puntaje"}</p>
            <p className="font-pixel text-[3.2rem] leading-none text-[var(--gold)]" style={{ textShadow: "0 4px 0 #000" }}>
              {puntajeFinal}
            </p>
            {final && (
              <p className="mt-2 text-[0.8rem] opacity-80">
                🎁 {final.atrapados.regalo} · ✨ {final.atrapados.dorado} · 🧾 {final.atrapados.factura} · ⚫ {final.atrapados.carbon} · 📦 {final.atrapados.caja} · racha {final.rachaMax}
              </p>
            )}
          </div>
          {resultado?.valida && (
            <div className="grid grid-cols-2 gap-2 text-center">
              <Premio e="🪙" t="Monedas" v={resultado.pretemporada ? "—" : `+${resultado.monedas}`} />
              <Premio e="📅" t="Hoy en este juego" v={resultado.pretemporada ? "—" : resultado.topeHoy ? `${resultado.monedasHoy}/${resultado.topeHoy}` : `${resultado.monedasHoy}`} />
            </div>
          )}
          {resultado?.valida && (
            <p className="text-center text-[0.82rem] text-[var(--ink-soft)]">
              {resultado.pretemporada
                ? "Pretemporada: las monedas empiezan el 25 de noviembre."
                : resultado.monedas > 0
                  ? `¡Nuevo mejor del día! Hoy llevas ${resultado.monedasHoy}/${resultado.topeHoy} monedas.`
                  : resultado.monedasHoy >= monedasDelDia(1e9)
                    ? "Ya tienes el máximo de monedas de hoy. Sigue por el récord."
                    : `Tu mejor de hoy sigue siendo ${resultado.mejorDelDia}. Supéralo para sumar más.`}
              {resultado.record === resultado.puntaje && resultado.puntaje > 0 ? " 🏆 ¡Récord personal!" : ""}
            </p>
          )}
          {resultado && !resultado.valida && <p className="px-box px-3 py-2 text-[0.85rem]" style={{ ["--bg" as string]: "#f3c9d1" }}>{resultado.motivo}</p>}
          {modo === "practica" && <p className="px-hint text-center">Partida de práctica: no se guarda.</p>}
          {error && (
            <p className="px-box px-3 py-2 text-[0.85rem]" role="alert" style={{ ["--bg" as string]: "#f3c9d1" }}>
              {error}
            </p>
          )}
          <div className="flex items-end gap-3">
            <span className="shrink-0">
              <NpcSprite id="auditor" size={56} />
            </span>
            <div className="px-box flex-1 px-3 py-2 text-[0.88rem]" style={{ ["--bg" as string]: "#fff" }}>
              {fraseDe("auditor", puntajeFinal >= 300 ? "partidaBuena" : "partidaMala", puntajeFinal + 7)}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={empezar} className="px-btn shine flex-1" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
              ↻ Otra vez
            </button>
            <Link href="/ranking" className="px-btn flex-1" style={{ ["--bg" as string]: "var(--gold)" }}>
              Ranking
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Dato({ t, v }: { t: string; v: number | string }) {
  return (
    <span className="leading-tight">
      <span className="block text-[0.68rem] uppercase text-[var(--ink-soft)]">{t}</span>
      <span className="block font-pixel text-lg tabular-nums">{v}</span>
    </span>
  );
}

function Premio({ e, t, v }: { e: string; t: string; v: string }) {
  return (
    <div className="px-box anim-pop px-2 py-2" style={{ ["--bg" as string]: "var(--cream-2)" }}>
      <div className="text-xl" aria-hidden>
        {e}
      </div>
      <div className="font-pixel text-lg">{v}</div>
      <div className="text-[0.7rem] text-[var(--ink-soft)]">{t}</div>
    </div>
  );
}

function SpriteMini({ def }: { def: SpriteDef }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const img = spriteACanvas(def, 2);
    c.width = img.width;
    c.height = img.height;
    c.getContext("2d")!.drawImage(img, 0, 0);
  }, [def]);
  return <canvas ref={ref} className="pixelated h-7 w-7 shrink-0" aria-hidden />;
}
