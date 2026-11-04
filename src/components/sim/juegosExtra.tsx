"use client";

import { useEffect, useRef, useState } from "react";
import { ACERTIJOS, BOTS, CALENDARIO, MISION_DOBLE, POZO, RETO_DUELO, ULTIMO_DIA, YO, ZONA_ESCONDITE, pistaDelDia, puntosSospecha } from "@/lib/sim/contenido";
import { MODULES } from "@/lib/modules";
import {
  META_MUNECO,
  apostar,
  bolasDeNieve,
  bot,
  completar,
  cumpliMision,
  hecho,
  nombre,
  pick,
  ranking,
  rnd,
  usarComodin,
  type SimState,
} from "@/lib/sim/store";
import { Ogre, Snowman } from "@/components/modules/Characters";
import { PixelAgent, AGENT_PALETTES } from "@/components/ui/PixelAgent";
import { Mantener } from "./juegosDiarios";
import { Agente, Boton, Marco, Opcion, Puntos, Resultado, Texto } from "./ui";

type P = { s: SimState };

/** Primer resultado guardado de un juego en cualquier día (para juegos de una sola vez). */
function unaVez<T>(s: SimState, juego: string): { day: number; v: T } | null {
  for (let d = 0; d <= ULTIMO_DIA; d++) {
    const v = s.done[`${juego}:${d}`];
    if (v !== undefined) return { day: d, v: v as T };
  }
  return null;
}

// ------------------------------------------------------- ranking
export function RankingSim({ s }: P) {
  const filas = ranking(s);
  return (
    <Marco juego="ranking" emoji="🏆" titulo="Ranking en vivo" como={["El ranking suma todos los movimientos del libro de puntos.", "Se mueve cuando tú o los bots juegan, y al cerrar cada día.", "El top 3 al final se lleva el pozo."]}>
      <ol className="flex flex-col gap-1.5">
        {filas.map((f, i) => (
          <li key={f.pid} className="px-box flex items-center gap-2 px-3 py-1.5" style={{ ["--bg" as string]: f.pid === YO ? "var(--cream-2)" : "#fff", margin: "3px 0" }}>
            <span className="w-6 font-pixel">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
            <Agente avatar={f.avatar} nombre={f.codename + (f.pid === YO ? " (tú)" : "")} />
            <span className="ml-auto font-pixel tabular-nums">{f.points}</span>
          </li>
        ))}
      </ol>
      <div className="px-box p-3" style={{ ["--bg" as string]: "#fff" }}>
        <p className="font-pixel mb-1">📰 Últimas noticias</p>
        <ul className="flex flex-col gap-1 text-[0.85rem]">
          {s.feed.slice(-6).reverse().map((f, i) => (
            <li key={i}>
              <span className="text-[var(--ink-soft)]">Día {f.day}:</span> {f.text}
            </li>
          ))}
        </ul>
      </div>
    </Marco>
  );
}

// ------------------------------------------------------- apuestas
export function Apuesta({ s }: P) {
  const hoy = s.bets.find((b) => b.day === s.day);
  const [quien, setQuien] = useState<string | null>(null);
  const [monto, setMonto] = useState(10);
  return (
    <Marco
      juego="apuesta"
      emoji="🎲"
      titulo="Apuesta del día"
      como={[
        "Una apuesta al día: ¿quién sumará más puntos hoy?",
        "Apuesta de 1 a 20 puntos (tope fijo para que el pozo no se decida por suerte).",
        "Se resuelve al cerrar el día: si aciertas, ganas lo apostado; si fallas, lo pierdes.",
      ]}
    >
      {s.day === 0 || s.day >= ULTIMO_DIA ? (
        <p>Las apuestas abren del día 1 al 13.</p>
      ) : hoy ? (
        <Resultado tipo="info">
          Apostaste <b>{hoy.amount}</b> a que <b>{nombre(s, hoy.pick)}</b> suma más puntos hoy. Se resuelve al pasar al día siguiente.
        </Resultado>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1">
            {[{ id: YO, codename: s.me.codename, avatar: s.me.avatar }, ...BOTS].map((b) => (
              <Opcion key={b.id} onClick={() => setQuien(b.id)} estado={quien === b.id ? "elegida" : null}>
                {b.avatar} {b.codename}
              </Opcion>
            ))}
          </div>
          <label className="px-label">
            Monto: {monto} puntos
            <input type="range" min={1} max={20} value={monto} onChange={(e) => setMonto(Number(e.target.value))} className="w-full accent-[var(--cherry)]" />
          </label>
          <Boton disabled={!quien} onClick={() => quien && apostar(quien, monto)}>
            Apostar {monto}
          </Boton>
        </>
      )}
      {s.bets.filter((b) => b.result).length > 0 && (
        <ul className="text-[0.85rem]">
          {s.bets
            .filter((b) => b.result)
            .slice(-4)
            .map((b) => (
              <li key={b.day}>
                Día {b.day}: {nombre(s, b.pick)} · {b.result === "won" ? `ganaste +${b.amount}` : `perdiste −${b.amount}`}
              </li>
            ))}
        </ul>
      )}
    </Marco>
  );
}

// ------------------------------------------------------- comodines
export function Comodines({ s }: P) {
  const [msg, setMsg] = useState("");
  const [robando, setRobando] = useState(false);
  const mision = CALENDARIO[s.day];
  return (
    <Marco
      juego="comodines"
      emoji="🛡️"
      titulo="Comodines"
      como={[
        "Empiezas con 1 escudo. Ganas más comodines con rachas de 3 días.",
        "🛡️ Escudo: se usa solo cuando alguien te intenta robar.",
        "⚡ Doble: actívalo ANTES de cumplir la misión de hoy y vale el doble.",
        "🦹 Robar: le quitas 10 puntos a alguien; se entera, pero no sabe quién fue. Nadie baja de 0.",
      ]}
    >
      <div className="grid grid-cols-3 gap-2 text-center">
        {(
          [
            ["🛡️", "Escudo", s.powerups.escudo],
            ["⚡", "Doble", s.powerups.doble],
            ["🦹", "Robar", s.powerups.robar],
          ] as const
        ).map(([e, n, c]) => (
          <div key={n} className="px-box py-2" style={{ ["--bg" as string]: c > 0 ? "var(--gold)" : "#eee" }}>
            <div className="text-3xl">{e}</div>
            <div className="font-pixel text-[0.85rem]">
              {n} ×{c}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Boton
          color="var(--gold)"
          disabled={s.powerups.doble <= 0 || s.dobleDay === s.day || cumpliMision(s, s.day) || !mision || ["pretemporada", "final"].includes(mision)}
          onClick={() => setMsg(usarComodin("doble"))}
        >
          ⚡ Usar Doble en la misión de hoy
        </Boton>
        {!robando ? (
          <Boton color="var(--lavender)" disabled={s.powerups.robar <= 0} onClick={() => setRobando(true)}>
            🦹 Robar 10 puntos
          </Boton>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {BOTS.map((b) => (
              <Opcion
                key={b.id}
                onClick={() => {
                  setMsg(usarComodin("robar", b.id));
                  setRobando(false);
                }}
              >
                {b.avatar} {b.codename}
              </Opcion>
            ))}
          </div>
        )}
      </div>
      {s.powerups.doble + s.powerups.robar === 0 && <p className="px-hint">Consigue más comodines con una racha de 3 días seguidos cumpliendo la misión.</p>}
      {s.dobleDay === s.day && <Resultado tipo="info">⚡ Doble activo hoy.</Resultado>}
      {msg && <Resultado>{msg}</Resultado>}
    </Marco>
  );
}

// --------------------------------------------- minijuego: ¡Que no despierte!
type Fase = "dormido" | "aviso" | "despierto";

export function QueNoDespierte({ s }: P) {
  const juego = "ogro";
  const jugado = hecho<{ avance: number; gano: boolean }>(s, juego);
  const [jugando, setJugando] = useState(false);
  const [avance, setAvance] = useState(0);
  const [fase, setFase] = useState<Fase>("dormido");
  const [fin, setFin] = useState<null | { avance: number; gano: boolean }>(null);
  const apretando = useRef(false);
  const [presionando, setPresionando] = useState(false);
  const presionar = (v: boolean) => {
    apretando.current = v;
    setPresionando(v);
  };
  const st = useRef({ avance: 0, fase: "dormido" as Fase, hasta: 0 });

  useEffect(() => {
    if (!jugando) return;
    let raf = 0;
    let last = performance.now();
    st.current = { avance: 0, fase: "dormido", hasta: last + 1500 + Math.random() * 1500 };
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const c = st.current;
      if (now >= c.hasta) {
        if (c.fase === "dormido") {
          c.fase = "aviso";
          c.hasta = now + 450;
        } else if (c.fase === "aviso") {
          c.fase = "despierto";
          c.hasta = now + 900 + Math.random() * 500;
          navigator.vibrate?.(60);
        } else {
          c.fase = "dormido";
          c.hasta = now + 1100 + Math.random() * 1900;
        }
        setFase(c.fase);
      }
      if (apretando.current) {
        if (c.fase === "despierto") {
          const r = { avance: Math.round(c.avance), gano: false };
          setFin(r);
          setJugando(false);
          return;
        }
        c.avance = Math.min(100, c.avance + dt * 17);
        setAvance(c.avance);
        if (c.avance >= 100) {
          setFin({ avance: 100, gano: true });
          setJugando(false);
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [jugando]);

  useEffect(() => {
    if (!fin || jugado) return;
    const pts = fin.gano ? 5 : Math.max(1, Math.floor(fin.avance / 25));
    completar(juego, fin, pts, "Minijuego del ogro");
  }, [fin, jugado]);

  const res = jugado ?? fin;
  const ojos = fase === "despierto" ? "abiertos" : "cerrados";
  return (
    <Marco
      juego={juego}
      emoji="😴"
      titulo="¡Que no despierte!"
      jugado={Boolean(jugado)}
      como={[
        "MANTÉN presionado el botón para avanzar mientras el ogro ronca.",
        "Cuando le tiemble el ojo, ¡SUELTA! Si te ve avanzando, te atrapa.",
        "Llega a los regalos sin que te vea: +5. Si te atrapa, ganas según lo lejos que llegaste (+1 a +4).",
        "1 intento al día.",
      ]}
    >
      <div className="relative h-[190px] overflow-hidden" style={{ background: "radial-gradient(70% 90% at 70% 100%, #3b3560, #1d1838)", boxShadow: "0 0 0 3px var(--ink)" }}>
        <div className="absolute bottom-0 right-2" style={{ animation: fase === "dormido" ? "snore 2.4s ease-in-out infinite" : undefined, transformOrigin: "50% 100%" }}>
          <div style={{ animation: fase === "aviso" ? "icicle 0.12s linear infinite" : undefined }}>
            <Ogre size={120} ojos={ojos} />
          </div>
        </div>
        {fase === "dormido" && (
          <span className="absolute right-24 top-6 font-pixel text-xl text-white" style={{ animation: "zzz 1.6s ease-out infinite" }}>
            Z
          </span>
        )}
        {fase === "despierto" && <span className="absolute right-6 top-3 font-pixel text-2xl text-[var(--cherry)]">¡!</span>}
        <span className="absolute bottom-1 right-[130px] text-2xl">🎁</span>
        <div className="absolute bottom-0" style={{ left: `calc(${avance * 0.62}% + 4px)` }}>
          <div style={{ animation: jugando && presionando ? "walk-bob 0.3s steps(2) infinite" : undefined }}>
            <PixelAgent colors={AGENT_PALETTES[3]} size={30} />
          </div>
        </div>
        <div className="absolute inset-x-2 top-2 h-2 bg-white/20">
          <div className="h-full bg-[var(--gold)]" style={{ width: `${avance}%` }} />
        </div>
      </div>

      {res ? (
        res.gano ? (
          <Resultado>
            ¡Llegaste a los regalos sin que te vea! 🎁 <Puntos n={5} />
          </Resultado>
        ) : (
          <Resultado tipo="mal">
            ¡Te atrapó al {res.avance}%! 🧌 <Puntos n={Math.max(1, Math.floor(res.avance / 25))} />
          </Resultado>
        )
      ) : !jugando ? (
        <Boton
          onClick={() => {
            setAvance(0);
            setFase("dormido");
            setJugando(true);
          }}
        >
          Empezar
        </Boton>
      ) : (
        <button
          type="button"
          onPointerDown={() => presionar(true)}
          onPointerUp={() => presionar(false)}
          onPointerLeave={() => presionar(false)}
          onContextMenu={(e) => e.preventDefault()}
          className="px-btn w-full select-none !py-5 !text-[1.1rem]"
          style={{ ["--bg" as string]: fase === "dormido" ? "var(--pine)" : fase === "aviso" ? "var(--gold)" : "var(--cherry)", color: "var(--cream)", touchAction: "none" }}
        >
          {fase === "dormido" ? "MANTÉN para avanzar 🤫" : fase === "aviso" ? "¡Le tiembla el ojo! SUELTA" : "¡QUIETO!"}
        </button>
      )}
    </Marco>
  );
}

// ------------------------------------------------------- acertijo
export function Acertijo({ s }: P) {
  const juego = "acertijo";
  const jugado = hecho<{ elegida: number }>(s, juego);
  const a = ACERTIJOS[(Math.max(1, s.day) - 1) % ACERTIJOS.length];
  return (
    <Marco juego={juego} emoji="🧩" titulo="Acertijo del ogro" jugado={Boolean(jugado)} como={["El ogro te hace un acertijo al día, con 3 opciones.", "Si aciertas: +3. Si fallas, se come tu panetón (sin puntos)."]}>
      <p className="px-box p-3 text-[1.02rem]" style={{ ["--bg" as string]: "#fff" }}>
        🧌 “{a.q}”
      </p>
      {a.ops.map((o, i) => (
        <Opcion
          key={i}
          disabled={Boolean(jugado)}
          onClick={() => completar(juego, { elegida: i }, i === a.ok ? 3 : 0, "Acertijo")}
          estado={jugado ? (i === a.ok ? "correcta" : jugado.elegida === i ? "incorrecta" : null) : null}
        >
          {o}
        </Opcion>
      ))}
      {jugado && (jugado.elegida === a.ok ? <Resultado>¡Correcto! <Puntos n={3} /></Resultado> : <Resultado tipo="mal">Nooo, el ogro se comió tu panetón 🍞</Resultado>)}
    </Marco>
  );
}

// ------------------------------------------------------- rescata el regalo
export function Rescate({ s }: P) {
  const juego = "rescate";
  const jugado = hecho<{ zona: string }>(s, juego);
  return (
    <Marco
      juego={juego}
      emoji="🎁"
      titulo="Rescata el regalo"
      jugado={Boolean(jugado)}
      como={["El ogro escondió un regalo en una de las zonas de la aldea.", "Lee las 3 pistas y elige la zona correcta. Solo tienes 1 intento.", "Los 3 primeros en encontrarlo: +30, +20 y +10."]}
    >
      <ul className="px-box flex flex-col gap-1 p-3 text-[0.95rem]" style={{ ["--bg" as string]: "var(--cream-2)" }}>
        <li>🔎 1. “Ahí nadie compite: o ganan todos, o nadie.”</li>
        <li>🔎 2. “Hace frío y hay mucha nieve rodando.”</li>
        <li>🔎 3. “Alguien está armando algo gigante.”</li>
      </ul>
      {jugado ? (
        jugado.zona === ZONA_ESCONDITE ? (
          <Resultado>
            ¡Lo encontraste en el Taller del Muñeco Gigante! Llegaste 2.º <Puntos n={20} />
          </Resultado>
        ) : (
          <Resultado tipo="mal">No estaba ahí. Estaba en el Taller del Muñeco Gigante ☃️</Resultado>
        )
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {MODULES.map((m) => (
            <Opcion key={m.id} onClick={() => completar(juego, { zona: m.id }, m.id === ZONA_ESCONDITE ? 20 : 0, "Rescata el regalo")}>
              {m.icon} {m.title}
            </Opcion>
          ))}
        </div>
      )}
    </Marco>
  );
}

// ------------------------------------------------------- misterio
export function MiAmigoSecreto({ s }: P) {
  const sorteo = unaVez<boolean>(s, "sorteo");
  const r = bot(s.myReceiver);
  return (
    <Marco
      juego="sorteo"
      emoji="📮"
      titulo="Mi amigo secreto"
      jugado={Boolean(sorteo)}
      como={["El sorteo se hace en el servidor: nadie, ni el organizador, ve quién le toca a quién.", "Mantén presionado para revelar a quién le regalas.", "Debajo verás su wishlist y su rango de precio."]}
    >
      {sorteo ? (
        <div className="px-box anim-pop p-4 text-center" style={{ ["--bg" as string]: "var(--night)", color: "var(--cream)" }}>
          <span className="stamp-static font-pixel text-[0.75rem] text-[var(--cherry)]">CONFIDENCIAL</span>
          <p className="mt-2 font-pixel">Le regalas a…</p>
          <p className="my-2 text-5xl">{r.avatar}</p>
          <p className="font-pixel text-2xl text-[var(--gold)]">{r.codename}</p>
          <p className="mt-3 text-[0.9rem]">🎁 Wishlist: {r.wishlist}</p>
        </div>
      ) : (
        <Mantener texto="🔒 Mantén presionado para revelar" onListo={() => completar("sorteo", true, 0)} />
      )}
    </Marco>
  );
}

export function QuienTeRegala({ s }: P) {
  const previo = unaVez<{ voto: string }>(s, "sospecha");
  const pistas = Array.from({ length: s.day }, (_, i) => pistaDelDia(bot(s.mySanta), i + 1)).filter((_, i) => s.done[`puerta:${i + 1}`]);
  const pts = puntosSospecha(Math.max(1, s.day));
  return (
    <Marco
      juego="sospecha"
      emoji="❓"
      titulo="¿Quién te regala?"
      jugado={previo?.day === s.day}
      como={["Cada día, al abrir la puerta del calendario, recibes una pista de tu amigo secreto.", "Cuando creas saberlo, arriesga UNA sola vez.", `Mientras antes aciertes, más puntos: hoy valdría +${pts}. Fallar no resta.`]}
    >
      <div className="px-box p-3" style={{ ["--bg" as string]: "var(--cream-2)" }}>
        <p className="font-pixel">📜 Tus pistas ({pistas.length})</p>
        {pistas.length ? (
          <ul className="mt-1 list-disc pl-5 text-[0.9rem]">
            {pistas.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        ) : (
          <p className="px-hint">Abre la puerta del día para recibir pistas.</p>
        )}
      </div>
      {previo ? (
        previo.v.voto === s.mySanta ? (
          <Resultado>
            ¡Acertaste el día {previo.day}! Te regala {nombre(s, s.mySanta)} 🕵️ <Puntos n={puntosSospecha(Math.max(1, previo.day))} />
          </Resultado>
        ) : (
          <Resultado tipo="mal">Arriesgaste por {nombre(s, previo.v.voto)} el día {previo.day}… y no era. Lo sabrás en la gran final.</Resultado>
        )
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {BOTS.map((b) => (
            <Opcion
              key={b.id}
              onClick={() => {
                if (confirm(`¿Seguro? Solo tienes un intento. Arriesgas por ${b.codename}.`)) completar("sospecha", { voto: b.id }, b.id === s.mySanta ? pts : 0, "Adivinó a su amigo secreto");
              }}
            >
              {b.avatar} {b.codename}
            </Opcion>
          ))}
        </div>
      )}
    </Marco>
  );
}

// ------------------------------------------------------- pretemporada
export function Wishlist({ s }: P) {
  const juego = "wishlist";
  const jugado = unaVez<{ wishlist: string; pistas: string[] }>(s, juego);
  const [w, setW] = useState("");
  const [p, setP] = useState(["", "", ""]);
  return (
    <Marco
      juego={juego}
      emoji="📝"
      titulo="Mis pistas y wishlist"
      jugado={jugado?.day === s.day}
      como={["Antes del sorteo, escribe qué te gustaría recibir y tu rango de precio.", "Escribe 3 pistas sobre ti: se le revelarán, una por día, a la persona a quien TÚ le regalas, para que intente adivinar que eres su amigo secreto.", "Sé creativo: que no sea tan obvio, pero tampoco imposible."]}
    >
      {jugado ? (
        <Resultado>
          Guardado. Wishlist: “{jugado.v.wishlist}”. Pistas: {jugado.v.pistas.join(" · ")}
        </Resultado>
      ) : (
        <>
          <Texto valor={w} onChange={setW} placeholder="Ej. una taza grande, medias navideñas · hasta S/ 40" filas={2} />
          {p.map((x, i) => (
            <Texto key={i} valor={x} onChange={(v) => setP((a) => a.map((y, j) => (j === i ? v : y)))} placeholder={`Pista ${i + 1} sobre ti`} />
          ))}
          <button type="button" className="px-chip self-start" onClick={() => { setW("Un libro de misterio, chocolates · hasta S/ 40"); setP(["Me encanta el misterio", "Siempre llego temprano", "Mi color es el azul"]); }}>
            ✏️ Rellenar con un ejemplo
          </button>
          <Boton disabled={w.trim().length < 3 || p.some((x) => x.trim().length < 3)} onClick={() => completar(juego, { wishlist: w, pistas: p }, 0)}>
            Guardar
          </Boton>
        </>
      )}
    </Marco>
  );
}

export function Capsula({ s }: P) {
  const juego = "capsula";
  const jugado = unaVez<{ msg: string }>(s, juego);
  const [m, setM] = useState("");
  return (
    <Marco juego={juego} emoji="⏳" titulo="Cápsula del tiempo" jugado={jugado?.day === s.day} como={["Escribe un mensaje para el grupo.", "Nadie lo verá hasta el día de la entrega, cuando se abre en la gran final.", "+30 (misión semanal de pretemporada)."]}>
      {jugado ? (
        <Resultado>
          Mensaje sellado 🔒 hasta la gran final. <Puntos n={30} />
        </Resultado>
      ) : (
        <>
          <Texto valor={m} onChange={setM} placeholder="Querido grupo del futuro…" filas={4} max={500} />
          <Boton disabled={m.trim().length < 5} onClick={() => completar(juego, { msg: m }, 30, "Cápsula del tiempo")}>
            Sellar cápsula · +30
          </Boton>
        </>
      )}
    </Marco>
  );
}

export function Custodio({ s }: P) {
  const juego = "custodio";
  const jugado = unaVez<{ voto: string }>(s, juego);
  const ganador = pick(s, "custodio", BOTS.slice(0, 4));
  return (
    <Marco juego={juego} emoji="🗳️" titulo="Votación del custodio" jugado={jugado?.day === s.day} como={["Todos votan quién guardará el dinero del pozo (1 voto, no puedes votarte).", "Gana el más votado; si hay empate, se sortea con animación.", "El custodio marca quién pagó y entrega los premios. La página no mueve dinero."]}>
      {jugado ? (
        <Resultado>
          Votaste por {nombre(s, jugado.v.voto)}. Resultado: <b>{ganador.codename}</b> es el custodio con {3 + Math.floor(rnd(s, "cv") * 3)} votos 🔑
        </Resultado>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {BOTS.map((b) => (
            <Opcion key={b.id} onClick={() => completar(juego, { voto: b.id }, 0)}>
              {b.avatar} {b.codename}
            </Opcion>
          ))}
        </div>
      )}
    </Marco>
  );
}

// ------------------------------------------------------- semanales
const CUMPLIDOS_RECIBIDOS = ["Siempre haces reír al grupo, incluso en los peores días 💛", "Eres de las personas que más se preocupa por los demás", "Tu energía en los planes es contagiosa ✨"];

export function Cumplidos({ s }: P) {
  const juego = "cumplidos";
  const jugado = unaVez<{ msg: string }>(s, juego);
  const para = pick(s, "cumplido-para", BOTS);
  const [m, setM] = useState("");
  return (
    <Marco juego={juego} emoji="💌" titulo="Cadena de cumplidos" jugado={jugado?.day === s.day} como={["Misión semanal (días 1 al 7).", `Te tocó escribirle a ${para.codename}: un mensaje bonito y anónimo.`, "El día 7 todos reciben el suyo. +30."]}>
      {jugado ? (
        <Resultado>
          Mensaje enviado a {para.codename} 💌 <Puntos n={30} />
        </Resultado>
      ) : (
        <>
          <Agente avatar={para.avatar} nombre={para.codename} sub="Tu destinatario" />
          <Texto valor={m} onChange={setM} placeholder="Lo que más admiro de ti es…" filas={3} max={300} />
          <Boton disabled={m.trim().length < 10} onClick={() => completar(juego, { msg: m }, 30, "Cadena de cumplidos")}>
            Enviar anónimo · +30
          </Boton>
        </>
      )}
      {s.day >= 7 && (
        <Resultado tipo="info">
          💌 Recibiste un cumplido anónimo: “{pick(s, "cumplido-recibido", CUMPLIDOS_RECIBIDOS)}”
        </Resultado>
      )}
    </Marco>
  );
}

export function Duelo({ s }: P) {
  const juego = "duelo";
  const jugado = unaVez<{ txt: string }>(s, juego);
  const rival = pick(s, "rival", BOTS);
  const gano = rnd(s, "duelo-gana") < 0.5;
  const [t, setT] = useState("");
  const resuelto = Boolean(jugado) && s.day >= 13;
  const premiado = Boolean(unaVez(s, "duelo-premio"));
  useEffect(() => {
    if (resuelto && gano && !premiado) completar("duelo-premio", true, 20, "Ganó el duelo");
  }, [resuelto, gano, premiado]);
  return (
    <Marco juego={juego} emoji="☃️" titulo="Duelo de dos" jugado={jugado?.day === s.day} como={["Misión semanal (días 8 al 13).", `Tu rival: ${rival.codename}. Reto: ${RETO_DUELO}`, "Sube tu entrada (foto o descripción). El grupo vota al ganador el día 13.", "+30 por participar · +20 si ganas."]}>
      <div className="flex items-center justify-around">
        <Agente avatar={s.me.avatar} nombre="Tú" />
        <span className="font-pixel text-2xl">VS</span>
        <Agente avatar={rival.avatar} nombre={rival.codename} />
      </div>
      {jugado ? (
        <>
          <Resultado>
            Entrada enviada <Puntos n={30} />
          </Resultado>
          {resuelto ? (
            gano ? (
              <Resultado>
                ¡Ganaste el duelo! <Puntos n={20} />
              </Resultado>
            ) : (
              <Resultado tipo="mal">{rival.codename} ganó por poquito. ¡Revancha en la próxima temporada!</Resultado>
            )
          ) : (
            <p className="px-hint">El grupo vota el día 13. Avanza de día para ver el resultado.</p>
          )}
        </>
      ) : (
        <>
          <Texto valor={t} onChange={setT} placeholder="Describe tu muñeco (o súbelo en la versión real)" filas={2} />
          <Boton disabled={t.trim().length < 5} onClick={() => completar(juego, { txt: t }, 30, "Duelo de dos")}>
            Enviar entrada · +30
          </Boton>
        </>
      )}
    </Marco>
  );
}

// ------------------------------------------------------- espionaje
export function AgenteDoble({ s }: P) {
  const cumplida = unaVez<boolean>(s, "doble");
  const acusacion = unaVez<{ voto: string }>(s, "acusar");
  const descubierto = rnd(s, "doble-descubierto") < 0.3;
  return (
    <Marco
      juego="doble"
      emoji="🕶️"
      titulo="Agente doble"
      jugado={cumplida?.day === s.day}
      como={[
        "A 2 o 3 agentes al azar les llega una misión secreta. En esta prueba, ¡te tocó a ti!",
        "Cúmplela sin que nadie lo note: +25.",
        "Además, puedes acusar UNA vez a quien creas que es agente doble: si aciertas, +15.",
      ]}
    >
      <div className="px-box p-3" style={{ ["--bg" as string]: "var(--night)", color: "var(--cream)" }}>
        <span className="stamp-static font-pixel text-[0.7rem] text-[var(--cherry)]">SOLO PARA TUS OJOS</span>
        <p className="mt-2">{MISION_DOBLE}</p>
      </div>
      {cumplida ? (
        descubierto ? (
          <Resultado tipo="mal">La cumpliste… pero alguien te descubrió 👀. Sin puntos esta vez.</Resultado>
        ) : (
          <Resultado>
            Misión cumplida sin que nadie lo notara 🕶️ <Puntos n={25} />
          </Resultado>
        )
      ) : (
        <Boton color="var(--night)" onClick={() => completar("doble", true, descubierto ? 0 : 25, "Agente doble")}>
          <span className="text-[var(--cream)]">✅ ¡La cumplí!</span>
        </Boton>
      )}
      <p className="font-pixel mt-2">Acusar a otro agente doble</p>
      {acusacion ? (
        acusacion.v.voto === s.doubleAgent ? (
          <Resultado>
            ¡Bien visto! {nombre(s, s.doubleAgent)} era agente doble <Puntos n={15} />
          </Resultado>
        ) : (
          <Resultado tipo="mal">{nombre(s, acusacion.v.voto)} era inocente. Ya usaste tu acusación.</Resultado>
        )
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {BOTS.map((b) => (
            <Opcion key={b.id} onClick={() => completar("acusar", { voto: b.id }, b.id === s.doubleAgent ? 15 : 0, "Acusó a un agente doble")}>
              {b.avatar} {b.codename}
            </Opcion>
          ))}
        </div>
      )}
    </Marco>
  );
}

// ------------------------------------------------------- colaborativos
export function Muneco({ s }: P) {
  const bolas = bolasDeNieve(s);
  const quienes = [...(s.botsDone[s.day] ?? []).map((id) => bot(id).avatar), ...(cumpliMision(s, s.day) ? [s.me.avatar] : [])];
  const pct = Math.min(1, bolas / META_MUNECO);
  return (
    <Marco juego="muneco" emoji="⛄" titulo="Muñeco de nieve gigante" como={["No tienes que hacer nada extra: cada agente que cumple la misión del día suma una bola de nieve.", `Si ${META_MUNECO} de 9 agentes cumplen hoy, el muñeco se completa y TODOS ganan +5.`, "En el grupo real: 12 de 15."]}>
      <div className="flex items-end justify-center gap-4">
        <div style={{ opacity: 0.25 + pct * 0.75, filter: pct < 1 ? "grayscale(0.6)" : undefined }}>
          <Snowman size={110} />
        </div>
        <div className="text-center">
          <p className="font-pixel text-4xl tabular-nums">
            {bolas}/{META_MUNECO}
          </p>
          <p className="px-hint">bolas de nieve hoy</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 text-2xl">{quienes.map((a, i) => <span key={i}>{a}</span>)}</div>
      {bolas >= META_MUNECO ? (
        <Resultado>¡Meta cumplida! Al cerrar el día todos ganan +5 ☃️</Resultado>
      ) : cumpliMision(s, s.day) ? (
        <Resultado tipo="info">Tu bola ya está. Faltan {META_MUNECO - bolas}: ¡anima al grupo por WhatsApp!</Resultado>
      ) : (
        <Resultado tipo="info">Cumple la misión del día para sumar tu bola de nieve.</Resultado>
      )}
    </Marco>
  );
}

export function Mosaico({ s }: P) {
  let votos = 0;
  for (let d = 1; d <= s.day; d++) votos += Math.floor((s.botsDone[d]?.length ?? 0) / 2);
  votos += Object.keys(s.done).filter((k) => k.startsWith("votacion:") || k.startsWith("custodio:")).length * 2;
  const total = 24;
  const destapadas = Math.min(total, votos);
  const orden = Array.from({ length: total }, (_, i) => i).sort((a, b) => rnd(s, `mos:${a}`) - rnd(s, `mos:${b}`));
  return (
    <Marco juego="mosaico" emoji="🖼️" titulo="Mosaico del grupo" como={["Cada voto que alguien emite destapa una pieza de una imagen secreta.", "En el grupo real será una foto del grupo que sube el organizador.", "Se revela completa en la gran final."]}>
      <div className="mx-auto grid w-[240px] grid-cols-6" style={{ boxShadow: "0 0 0 3px var(--ink)" }}>
        {Array.from({ length: total }, (_, i) => {
          const abierta = orden.indexOf(i) < destapadas;
          const col = i % 6;
          const fila = Math.floor(i / 6);
          return (
            <div
              key={i}
              className="pixelated aspect-square"
              style={
                abierta
                  ? { backgroundImage: "url(/art/sprites/mascota.png)", backgroundSize: "600% 400%", backgroundPosition: `${col * 20}% ${fila * 33.3}%`, backgroundColor: "var(--sky)" }
                  : { background: i % 2 ? "#5d5677" : "#4a4166" }
              }
            />
          );
        })}
      </div>
      <p className="text-center font-pixel">
        {destapadas}/{total} piezas
      </p>
    </Marco>
  );
}

export function Fogata({ s }: P) {
  let racha = 0;
  for (let d = s.day; d >= 1; d--) {
    if (cumpliMision(s, d)) racha++;
    else if (d !== s.day) break;
  }
  return (
    <Marco juego="fogata" emoji="🔥" titulo="Fogata del equipo" como={["Si TODOS los agentes entran 3 días seguidos, al día siguiente la misión vale doble para todos.", "Tu racha personal de misiones también da +15 y un comodín cada 3 días."]}>
      <div className="flex items-center justify-center gap-1 text-5xl" aria-hidden>
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} style={{ opacity: i < Math.min(3, racha) ? 1 : 0.2, animation: i < racha ? "glow-pulse 1s steps(3) infinite" : undefined, animationDelay: `${i * 0.2}s` }}>
            🔥
          </span>
        ))}
      </div>
      <p className="text-center font-pixel">Tu racha: {racha} día(s)</p>
    </Marco>
  );
}

// ------------------------------------------------------- logros
export function Insignias({ s }: P) {
  const misiones = Object.keys(s.done).filter((k) => {
    const [j, d] = k.split(":");
    return CALENDARIO[Number(d)] === j;
  }).length;
  const verdad = Object.entries(s.done).some(([k, v]) => k.startsWith("verdad:") && (v as { enganio?: boolean })?.enganio);
  const sospecha = unaVez<{ voto: string }>(s, "sospecha");
  const lista: [string, string, string, boolean][] = [
    ["🌅", "Madrugador", "Cumple 3 misiones", misiones >= 3],
    ["🕵️", "Detective", "Adivina a tu amigo secreto", sospecha?.v.voto === s.mySanta],
    ["😂", "Rey del meme", "Envía el meme al amigo secreto", Object.keys(s.done).some((k) => k.startsWith("meme:"))],
    ["📸", "Más votado", "Gana una votación de fotos", s.ledger.some((m) => m.pid === YO && m.reason.startsWith("Foto más votada"))],
    ["🕶️", "Doble agente", "Cumple tu misión secreta", Object.keys(s.done).some((k) => k.startsWith("doble:"))],
    ["🎭", "El Misterioso", "Engaña a la mayoría en verdad o mentira", verdad],
  ];
  return (
    <Marco juego="insignias" emoji="🏅" titulo="Insignias" como={["Reconocimientos sin puntos: sirven para presumir en el resumen final.", "Se desbloquean solas al jugar."]}>
      <div className="grid grid-cols-2 gap-2">
        {lista.map(([e, n, d, ok]) => (
          <div key={n} className="px-box p-2 text-center" style={{ ["--bg" as string]: ok ? "var(--gold)" : "#eee", opacity: ok ? 1 : 0.6 }}>
            <div className="text-3xl" style={{ filter: ok ? undefined : "grayscale(1)" }}>
              {e}
            </div>
            <div className="font-pixel text-[0.9rem]">{n}</div>
            <div className="text-[0.7rem]">{d}</div>
          </div>
        ))}
      </div>
    </Marco>
  );
}

export function Calendario({ s }: P) {
  return (
    <Marco juego="calendario" emoji="🎄" titulo="Calendario de adviento" como={["Las puertas pasadas están abiertas, la de hoy brilla y las futuras tienen candado.", "Cada puerta abierta guarda la pista de ese día."]}>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: ULTIMO_DIA + 1 }, (_, d) => {
          const abierta = Boolean(s.done[`puerta:${d}`]);
          const hoy = d === s.day;
          const futura = d > s.day;
          return (
            <div
              key={d}
              className="flex aspect-square flex-col items-center justify-center font-pixel"
              style={{
                background: futura ? "#cfc7d8" : abierta ? "var(--mint)" : hoy ? "var(--gold)" : "var(--cherry)",
                color: futura ? "var(--ink-soft)" : abierta || hoy ? "var(--ink)" : "var(--cream)",
                boxShadow: `0 0 0 ${hoy ? 3 : 2}px var(--ink)`,
                animation: hoy ? "glow-pulse 1.4s steps(3) infinite" : undefined,
              }}
              title={abierta ? pistaDelDia(bot(s.mySanta), d) : undefined}
            >
              <span className="text-lg">{futura ? "🔒" : abierta ? "🎁" : d === 0 ? "★" : d}</span>
              <span className="text-[10px]">{d === 0 ? "pre" : d === ULTIMO_DIA ? "final" : `día ${d}`}</span>
            </div>
          );
        })}
      </div>
    </Marco>
  );
}

// ------------------------------------------------------- bóveda
export function Pozo({ s }: P) {
  const pagaron = BOTS.filter((b) => rnd(s, `pago:${b.id}`) < 0.85).length + 1;
  return (
    <Marco juego="pozo" emoji="💰" titulo="El pozo" como={["Cada uno pone S/ 50: S/ 40 para el regalo y S/ 10 al pozo.", "El custodio (elegido por votación) guarda el dinero y marca quién pagó.", "El top 3 del ranking se lleva el pozo: 60 % · 27 % · 13 %."]}>
      <div className="px-box p-4 text-center" style={{ ["--bg" as string]: "var(--gold)" }}>
        <p className="font-pixel text-4xl">S/ {POZO.total}</p>
        <p className="text-[0.85rem]">
          {pagaron} de {BOTS.length + 1} ya pagaron (simulado)
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {POZO.reparto.map((p, i) => (
          <div key={i} className="px-box py-2" style={{ ["--bg" as string]: "#fff" }}>
            <div className="text-2xl">{["🥇", "🥈", "🥉"][i]}</div>
            <div className="font-pixel">S/ {POZO.montos[i]}</div>
            <div className="text-[0.7rem]">{p} %</div>
          </div>
        ))}
      </div>
    </Marco>
  );
}

export function GranFinal({ s }: P) {
  const jugado = hecho<boolean>(s, "final");
  const [paso, setPaso] = useState(0);
  const sospecha = unaVez<{ voto: string }>(s, "sospecha");
  const capsula = unaVez<{ msg: string }>(s, "capsula");
  const top = ranking(s).slice(0, 3);
  const santa = bot(s.mySanta);
  return (
    <Marco juego="final" emoji="🏆" titulo="Gran final" jugado={Boolean(jugado)} como={["Día de la entrega de regalos, en persona.", "1. Se revela quién le regaló a quién.", "2. Podio final con los montos del pozo.", "3. Se abre la cápsula del tiempo."]}>
      {s.day < ULTIMO_DIA && <p className="px-hint">Normalmente se juega el día {ULTIMO_DIA}. Puedes probarla ahora.</p>}
      {paso === 0 && (
        <Mantener
          texto="🎁 Mantén presionado: ¿quién te regaló?"
          onListo={() => {
            setPaso(1);
            if (!jugado) completar("final", true, 0);
          }}
        />
      )}
      {paso >= 1 && (
        <div className="px-box anim-pop p-4 text-center" style={{ ["--bg" as string]: "var(--night)", color: "var(--cream)" }}>
          <p className="font-pixel">Tu amigo secreto era…</p>
          <p className="my-2 text-5xl">{santa.avatar}</p>
          <p className="font-pixel text-2xl text-[var(--gold)]">{santa.codename}</p>
          <p className="mt-2 text-[0.9rem]">{sospecha ? (sospecha.v.voto === s.mySanta ? "¡Y lo adivinaste! 🕵️" : `Tú apostaste por ${nombre(s, sospecha.v.voto)} 😅`) : "Nunca arriesgaste tu sospecha 👀"}</p>
          {paso === 1 && (
            <button type="button" className="px-chip mt-3" onClick={() => setPaso(2)}>
              Ver el podio →
            </button>
          )}
        </div>
      )}
      {paso >= 2 && (
        <div className="anim-pop flex items-end justify-center gap-2">
          {[1, 0, 2].map((i) => {
            const f = top[i];
            if (!f) return null;
            return (
              <div key={f.pid} className="flex w-[30%] flex-col items-center">
                <span className="text-3xl">{f.avatar}</span>
                <span className="text-center font-pixel text-[0.75rem] leading-tight">{f.codename}</span>
                <div className="mt-1 flex w-full flex-col items-center justify-start pt-1 font-pixel" style={{ height: [90, 64, 44][i], background: ["var(--gold)", "#c9d6f0", "#d9a06c"][i], boxShadow: "0 0 0 2px var(--ink)" }}>
                  <span>{["🥇", "🥈", "🥉"][i]}</span>
                  <span className="text-[0.85rem]">S/ {POZO.montos[i]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {paso === 2 && (
        <button type="button" className="px-chip self-center" onClick={() => setPaso(3)}>
          Abrir la cápsula del tiempo →
        </button>
      )}
      {paso >= 3 && (
        <div className="anim-pop flex flex-col gap-2">
          {[capsula ? { de: s.me.codename, msg: capsula.v.msg } : null, { de: BOTS[2].codename, msg: "Que el próximo año sigamos igual de locos 💛" }, { de: BOTS[0].codename, msg: "Prometo no comerme todo el panetón (mentira)" }]
            .filter(Boolean)
            .map((c, i) => (
              <div key={i} className="px-box p-3" style={{ ["--bg" as string]: "#fff" }}>
                <p className="text-[0.95rem]">“{c!.msg}”</p>
                <p className="px-hint">— {c!.de}</p>
              </div>
            ))}
        </div>
      )}
    </Marco>
  );
}

/** Cuy pixel decorativo para pantallas vacías. */
export function CuyVacio({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/art/sprites/mascota.png" alt="" className="pixelated h-20 w-auto" style={{ animation: "bob 1.2s steps(2) infinite" }} />
      <p className="px-hint">{texto}</p>
    </div>
  );
}
