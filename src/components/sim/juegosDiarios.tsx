"use client";

import { useEffect, useRef, useState } from "react";
import { BOTS, CALENDARIO, EMOJIS_PALETA, PALABRAS, TEMAS_FOTO, TRIVIA, pistaDelDia, YO } from "@/lib/sim/contenido";
import { bot, completar, guardar, hecho, nombre, pick, rnd, type SimState } from "@/lib/sim/store";
import { Agente, Boton, Marco, Opcion, Puntos, Resultado, Texto } from "./ui";

type P = { s: SimState };

/** Mantener presionado para revelar (suspenso + evita revelar sin querer). */
export function Mantener({ texto, onListo, color = "var(--cherry)" }: { texto: string; onListo: () => void; color?: string }) {
  const [p, setP] = useState(0);
  const timer = useRef(0);
  const t0 = useRef(0);
  const soltar = () => {
    window.clearInterval(timer.current);
    setP(0);
  };
  const apretar = () => {
    t0.current = performance.now();
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0.current) / 1300);
      setP(k);
      if (k >= 1) {
        window.clearInterval(timer.current);
        navigator.vibrate?.(30);
        onListo();
      }
    }, 30);
  };
  return (
    <button
      type="button"
      onPointerDown={apretar}
      onPointerUp={soltar}
      onPointerLeave={soltar}
      onContextMenu={(e) => e.preventDefault()}
      className="px-btn relative w-full select-none overflow-hidden"
      style={{ ["--bg" as string]: color, color: "var(--cream)", touchAction: "none" }}
    >
      <span className="absolute inset-y-0 left-0 bg-white/35" style={{ width: `${p * 100}%` }} aria-hidden />
      <span className="relative">{p > 0 ? "Sigue presionando…" : texto}</span>
    </button>
  );
}

// ------------------------------------------------------- puerta del día
export function PuertaDelDia({ s }: P) {
  const jugado = hecho<{ pista: string }>(s, "puerta");
  const santa = bot(s.mySanta);
  return (
    <Marco
      juego="puerta"
      emoji="🎄"
      titulo={`Puerta del día ${s.day}`}
      jugado={Boolean(jugado)}
      como={[
        "Cada día se abre una puerta del calendario de adviento.",
        "Detrás hay una pista nueva sobre quién te regala (la escribió tu amigo secreto).",
        "Junta las pistas y, cuando estés seguro, arriesga en «¿Quién te regala?».",
      ]}
    >
      {s.day === 0 ? (
        <p>La primera puerta se abre el día 1, cuando empieza la temporada.</p>
      ) : jugado ? (
        <Resultado tipo="info">
          <p className="font-pixel">📜 Pista del día {s.day}</p>
          <p className="mt-1 text-[1.05rem]">“{jugado.pista}”</p>
        </Resultado>
      ) : (
        <Mantener texto="🎁 Mantén presionado para abrir la puerta" color="var(--pine)" onListo={() => completar("puerta", { pista: pistaDelDia(santa, s.day) }, 0)} />
      )}
    </Marco>
  );
}

// ------------------------------------------------------------- foto
async function comprimir(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 320 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.7);
}

export function FotoMision({ s }: P) {
  const jugado = hecho<{ img: string | null }>(s, "foto");
  const [img, setImg] = useState<string | null>(null);
  const [usandoPrueba, setUsandoPrueba] = useState(false);
  const tema = TEMAS_FOTO[s.day] ?? "Tema libre: algo navideño cerca de ti";
  return (
    <Marco
      juego="foto"
      emoji="📸"
      titulo="Foto misión"
      jugado={Boolean(jugado)}
      como={[
        `Tema de hoy: «${tema}».`,
        "Toma la foto con tu celular y súbela (2 toques). Se comprime sola.",
        "Mañana todas las fotos se muestran SIN nombre en la Galería y el grupo vota su favorita.",
        "+10 por subirla · +20 si es la más votada · +10 la segunda.",
      ]}
    >
      <div className="px-box px-3 py-2 font-pixel" style={{ ["--bg" as string]: "var(--rose)" }}>
        Tema: {tema}
      </div>
      {jugado ? (
        <>
          {jugado.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={jugado.img} alt="Tu foto" className="w-full max-w-[220px] self-center" style={{ boxShadow: "0 0 0 3px var(--ink)" }} />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center self-center bg-[var(--rose)] text-6xl" style={{ boxShadow: "0 0 0 3px var(--ink)" }}>
              🍎
            </div>
          )}
          <Resultado>
            Foto subida <Puntos n={10} />. Mañana se vota en la <b>Galería del Tendedero</b>.
          </Resultado>
        </>
      ) : (
        <>
          <label className="px-btn w-full cursor-pointer" style={{ ["--bg" as string]: "var(--gold)" }}>
            📷 Tomar o elegir foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setImg(await comprimir(f));
              }}
            />
          </label>
          <button type="button" className="px-chip self-center" onClick={() => setUsandoPrueba(true)}>
            o usar una foto de prueba
          </button>
          {(img || usandoPrueba) && (
            <>
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="Vista previa" className="w-full max-w-[220px] self-center" style={{ boxShadow: "0 0 0 3px var(--ink)" }} />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center self-center bg-[var(--rose)] text-6xl" style={{ boxShadow: "0 0 0 3px var(--ink)" }}>
                  🍎
                </div>
              )}
              <Boton onClick={() => completar("foto", { img }, 10, "Foto misión")}>Subir foto · +10</Boton>
            </>
          )}
        </>
      )}
    </Marco>
  );
}

// ---------------------------------------------------- votación de fotos
export function VotarFotos({ s }: P) {
  const jugado = hecho<{ voto: string }>(s, "votacion");
  // fotos del último día de foto anterior a hoy (o de prueba)
  let diaFoto = s.day - 1;
  while (diaFoto > 0 && CALENDARIO[diaFoto] !== "foto") diaFoto--;
  const autores: string[] = diaFoto > 0 ? [...(s.botsDone[diaFoto] ?? [])] : BOTS.slice(0, 5).map((b) => b.id);
  if (autores.length < 3) autores.push(...BOTS.filter((b) => !autores.includes(b.id)).slice(0, 3 - autores.length).map((b) => b.id));
  const mia = diaFoto > 0 ? hecho<{ img: string | null }>(s, "foto", diaFoto) : undefined;
  const fotos = [...autores, ...(mia ? [YO] : [])].sort((a, b) => rnd(s, `orden:${a}`) - rnd(s, `orden:${b}`));
  return (
    <Marco
      juego="votacion"
      emoji="🖼️"
      titulo="Muro de fotos"
      jugado={Boolean(jugado)}
      como={[
        "Aquí están las fotos de la última Foto misión, sin nombre.",
        "Toca tu favorita para votar (1 voto, no puedes votar la tuya).",
        "Al votar se revela de quién era cada foto. Los puntos a los ganadores llegan al cerrar la votación (al pasar al día siguiente).",
      ]}
    >
      <p className="px-hint">{diaFoto > 0 ? `Fotos del día ${diaFoto}` : "Fotos de prueba (aún no hubo Foto misión)"}</p>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((pid, i) => {
          const esMia = pid === YO;
          const b = esMia ? null : bot(pid);
          const votada = jugado?.voto === pid;
          return (
            <button
              key={pid}
              type="button"
              disabled={Boolean(jugado) || esMia}
              onClick={() => completar("votacion", { voto: pid }, 0)}
              className="relative flex aspect-square flex-col items-center justify-center overflow-hidden text-4xl transition-transform active:scale-95"
              style={{ background: b?.color ?? "#fff", boxShadow: `0 0 0 ${votada ? 4 : 2}px var(--ink)`, transform: votada ? "rotate(-2deg) scale(1.04)" : undefined }}
            >
              {esMia && mia?.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mia.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span>{esMia ? "🍎" : b!.emojis[0]}</span>
              )}
              <span className="absolute left-1 top-1 bg-white/90 px-1 font-pixel text-[10px]">#{i + 1}</span>
              {(jugado || esMia) && (
                <span className="absolute inset-x-0 bottom-0 bg-white/90 px-1 text-center font-pixel text-[10px] leading-tight">
                  {esMia ? "Tu foto" : b!.codename.replace("Agente ", "")}
                  {votada ? " ★" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {jugado && <Resultado>Votaste por la foto de <b>{nombre(s, jugado.voto)}</b>. Los ganadores se anuncian al cerrar la votación.</Resultado>}
    </Marco>
  );
}

// ------------------------------------------------- juegos de adivinar
function useTres(s: SimState, clave: string) {
  const orden = [...BOTS].sort((a, b) => rnd(s, `${clave}:${a.id}:${s.day}`) - rnd(s, `${clave}:${b.id}:${s.day}`));
  return orden.slice(0, 3);
}

function opcionesNombres(s: SimState, correcto: string, clave: string) {
  const otros = BOTS.filter((b) => b.id !== correcto).sort((a, b) => rnd(s, `${clave}:${a.id}`) - rnd(s, `${clave}:${b.id}`)).slice(0, 2);
  return [bot(correcto), ...otros].sort((a, b) => rnd(s, `${clave}:o:${a.id}`) - rnd(s, `${clave}:o:${b.id}`));
}

export function VerdadOMentira({ s }: P) {
  const juego = "verdad";
  const jugado = hecho<{ total: number; aciertos: number; enganio: boolean }>(s, juego);
  const borrador = hecho<{ datos: string[]; mentira: number }>(s, "verdad-borrador");
  const [datos, setDatos] = useState(["", "", ""]);
  const [mentira, setMentira] = useState<number | null>(null);
  const [resp, setResp] = useState<Record<string, number>>({});
  const tres = useTres(s, "vom");
  return (
    <Marco
      juego={juego}
      emoji="🤥"
      titulo="Verdad o mentira"
      jugado={Boolean(jugado)}
      como={[
        "Escribe 3 datos sobre ti: 2 verdaderos y 1 falso. Marca cuál es la mentira.",
        "Luego adivina la mentira de 3 agentes elegidos al azar.",
        "+10 por participar · +5 por cada acierto · +15 si tu mentira engaña a la mayoría.",
      ]}
    >
      {jugado ? (
        <Resultado>
          Acertaste {jugado.aciertos} de 3 <Puntos n={jugado.aciertos * 5} />
          {jugado.enganio ? (
            <>
              {" "}
              · ¡Tu mentira engañó a la mayoría! <Puntos n={15} />
            </>
          ) : (
            " · Tu mentira no engañó a casi nadie 😅"
          )}
        </Resultado>
      ) : !borrador ? (
        <>
          <p className="font-pixel">1. Tus 3 datos</p>
          {datos.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMentira(i)}
                className="px-chip shrink-0"
                style={{ ["--chip" as string]: mentira === i ? "var(--cherry)" : "#fff", color: mentira === i ? "var(--cream)" : undefined }}
                aria-pressed={mentira === i}
              >
                {mentira === i ? "🤥 Mentira" : "¿mentira?"}
              </button>
              <Texto valor={d} onChange={(v) => setDatos((x) => x.map((y, j) => (j === i ? v : y)))} placeholder={`Dato ${i + 1}`} />
            </div>
          ))}
          <button type="button" className="px-chip self-start" onClick={() => { setDatos(["Me comí un panetón entero solo", "Sé bailar marinera", "Nunca he visto el mar"]); setMentira(2); }}>
            ✏️ Rellenar con un ejemplo
          </button>
          <Boton disabled={datos.some((d) => d.trim().length < 3) || mentira === null} onClick={() => guardar("verdad-borrador", { datos, mentira })}>
            Listo, ahora a adivinar
          </Boton>
        </>
      ) : (
        <>
          <p className="font-pixel">2. ¿Cuál es la mentira?</p>
          {tres.map((b) => (
            <div key={b.id} className="px-box p-3" style={{ ["--bg" as string]: "#fff" }}>
              <Agente avatar={b.avatar} nombre={b.codename} />
              {b.datos.map((d, i) => (
                <Opcion
                  key={i}
                  disabled={resp[b.id] !== undefined}
                  onClick={() => setResp((r) => ({ ...r, [b.id]: i }))}
                  estado={resp[b.id] === undefined ? null : i === b.mentira ? "correcta" : resp[b.id] === i ? "incorrecta" : null}
                >
                  {d}
                </Opcion>
              ))}
            </div>
          ))}
          <Boton
            disabled={Object.keys(resp).length < 3}
            onClick={() => {
              const aciertos = tres.filter((b) => resp[b.id] === b.mentira).length;
              const enganio = rnd(s, `enganio:${s.day}`) < 0.5;
              completar(juego, { total: 3, aciertos, enganio }, 10 + aciertos * 5 + (enganio ? 15 : 0), "Verdad o mentira");
            }}
          >
            Ver mis puntos
          </Boton>
        </>
      )}
    </Marco>
  );
}

export function EmojiResumen({ s }: P) {
  const juego = "emoji";
  const jugado = hecho<{ aciertos: number }>(s, juego);
  const mios = hecho<string[]>(s, "emoji-borrador");
  const [sel, setSel] = useState<string[]>([]);
  const [resp, setResp] = useState<Record<string, string>>({});
  const tres = useTres(s, "emo");
  return (
    <Marco
      juego={juego}
      emoji="🤪"
      titulo="Emoji resumen"
      jugado={Boolean(jugado)}
      como={["Resume tu día en 3 emojis.", "Luego adivina de quién es cada combinación de emojis de otros 3 agentes.", "+10 por participar · +5 por cada acierto."]}
    >
      {jugado ? (
        <Resultado>
          Adivinaste {jugado.aciertos} de 3 <Puntos n={10 + jugado.aciertos * 5} />
        </Resultado>
      ) : !mios ? (
        <>
          <div className="flex min-h-12 items-center justify-center gap-2 text-4xl">{sel.length ? sel.join(" ") : <span className="px-hint">Elige 3</span>}</div>
          <div className="grid grid-cols-5 gap-2">
            {EMOJIS_PALETA.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setSel((x) => (x.includes(e) ? x.filter((y) => y !== e) : x.length < 3 ? [...x, e] : x))}
                className="flex aspect-square items-center justify-center text-2xl"
                style={{ background: sel.includes(e) ? "var(--gold)" : "#fff", boxShadow: "0 0 0 2px var(--ink)" }}
              >
                {e}
              </button>
            ))}
          </div>
          <Boton disabled={sel.length !== 3} onClick={() => guardar("emoji-borrador", sel)}>
            Listo, ahora a adivinar
          </Boton>
        </>
      ) : (
        <>
          <p className="font-pixel">¿De quién es cada combinación?</p>
          {tres.map((b) => (
            <div key={b.id} className="px-box p-3" style={{ ["--bg" as string]: "#fff" }}>
              <p className="text-center text-4xl">{b.emojis.join(" ")}</p>
              {opcionesNombres(s, b.id, `emo:${b.id}:${s.day}`).map((o) => (
                <Opcion
                  key={o.id}
                  disabled={resp[b.id] !== undefined}
                  onClick={() => setResp((r) => ({ ...r, [b.id]: o.id }))}
                  estado={resp[b.id] === undefined ? null : o.id === b.id ? "correcta" : resp[b.id] === o.id ? "incorrecta" : null}
                >
                  {o.avatar} {o.codename}
                </Opcion>
              ))}
            </div>
          ))}
          <Boton
            disabled={Object.keys(resp).length < 3}
            onClick={() => {
              const aciertos = tres.filter((b) => resp[b.id] === b.id).length;
              completar(juego, { aciertos }, 10 + aciertos * 5, "Emoji resumen");
            }}
          >
            Ver mis puntos
          </Boton>
        </>
      )}
    </Marco>
  );
}

export function PalabraSecreta({ s }: P) {
  const juego = "palabra";
  const jugado = hecho<{ ok: boolean; quien: string }>(s, juego);
  const palabra = pick(s, `palabra:${s.day}`, PALABRAS);
  const [ver, setVer] = useState(false);
  const [paso, setPaso] = useState<"inicio" | "elegir" | "esperando">("inicio");
  const [quien, setQuien] = useState<string | null>(null);
  useEffect(() => {
    if (paso !== "esperando" || !quien) return;
    const t = window.setTimeout(() => {
      const ok = rnd(s, `palabra-ok:${quien}:${s.day}`) < 0.8;
      completar(juego, { ok, quien }, ok ? 15 : 0, "Palabra secreta");
    }, 1600);
    return () => window.clearTimeout(t);
  }, [paso, quien, s]);
  return (
    <Marco
      juego={juego}
      emoji="🤫"
      titulo="Palabra secreta"
      jugado={Boolean(jugado)}
      como={[
        "La página te da una palabra rara. Solo tú la ves.",
        "Tu misión: lograr que alguien la diga en el chat de WhatsApp sin que se dé cuenta.",
        "Cuando pase, toca «¡Lo logré!» y elige quién la dijo. A esa persona le llega «¿dijiste esta palabra?» y confirma.",
        "+15 si confirma.",
      ]}
    >
      {jugado ? (
        jugado.ok ? (
          <Resultado>
            {nombre(s, jugado.quien)} confirmó que dijo «{palabra}» 🎯 <Puntos n={15} />
          </Resultado>
        ) : (
          <Resultado tipo="mal">{nombre(s, jugado.quien)} dice que no dijo esa palabra 😅. ¡Mañana hay otra misión!</Resultado>
        )
      ) : (
        <>
          <button type="button" onClick={() => setVer((v) => !v)} className="px-box py-4 text-center font-pixel text-3xl" style={{ ["--bg" as string]: "var(--night)", color: "var(--gold)" }}>
            {ver ? palabra.toUpperCase() : "🔒 Toca para ver tu palabra"}
          </button>
          {paso === "inicio" && <Boton onClick={() => setPaso("elegir")}>🎯 ¡Lo logré! Alguien la dijo</Boton>}
          {paso === "elegir" && (
            <>
              <p className="font-pixel">¿Quién la dijo en el chat?</p>
              <div className="grid grid-cols-2 gap-1">
                {BOTS.map((b) => (
                  <Opcion key={b.id} onClick={() => { setQuien(b.id); setPaso("esperando"); }}>
                    {b.avatar} {b.codename}
                  </Opcion>
                ))}
              </div>
            </>
          )}
          {paso === "esperando" && <Resultado tipo="info">⏳ Esperando que {nombre(s, quien!)} confirme…</Resultado>}
        </>
      )}
    </Marco>
  );
}

function Preguntas({
  s,
  juego,
  emoji,
  titulo,
  como,
  items,
  base,
}: {
  s: SimState;
  juego: string;
  emoji: string;
  titulo: string;
  como: string[];
  items: { texto: string; correcto: string }[];
  base: number;
}) {
  const jugado = hecho<{ aciertos: number }>(s, juego);
  const [resp, setResp] = useState<Record<number, string>>({});
  return (
    <Marco juego={juego} emoji={emoji} titulo={titulo} jugado={Boolean(jugado)} como={como}>
      {jugado ? (
        <Resultado>
          Acertaste {jugado.aciertos} de {items.length} <Puntos n={base + jugado.aciertos * 5} />
        </Resultado>
      ) : (
        <>
          {items.map((it, i) => (
            <div key={i} className="px-box p-3" style={{ ["--bg" as string]: "#fff" }}>
              <p className="font-pixel">{it.texto}</p>
              {opcionesNombres(s, it.correcto, `${juego}:${i}:${s.day}`).map((o) => (
                <Opcion
                  key={o.id}
                  disabled={resp[i] !== undefined}
                  onClick={() => setResp((r) => ({ ...r, [i]: o.id }))}
                  estado={resp[i] === undefined ? null : o.id === it.correcto ? "correcta" : resp[i] === o.id ? "incorrecta" : null}
                >
                  {o.avatar} {o.codename}
                </Opcion>
              ))}
            </div>
          ))}
          <Boton
            disabled={Object.keys(resp).length < items.length}
            onClick={() => {
              const aciertos = items.filter((it, i) => resp[i] === it.correcto).length;
              completar(juego, { aciertos }, base + aciertos * 5, titulo);
            }}
          >
            Ver mis puntos
          </Boton>
        </>
      )}
    </Marco>
  );
}

export function Trivia({ s }: P) {
  const preguntas = TRIVIA[s.day] ?? TRIVIA[5];
  return (
    <Preguntas
      s={s}
      juego="trivia"
      emoji="🧠"
      titulo="Trivia del grupo"
      base={10}
      como={["Preguntas sobre ustedes mismos (las escriben los propios agentes).", "La respuesta correcta es la que eligió la mayoría del grupo.", "+10 por participar · +5 por cada acierto."]}
      items={preguntas.map((p) => ({ texto: p.pregunta, correcto: p.respuesta }))}
    />
  );
}

export function AdivinaQuien({ s }: P) {
  const tres = useTres(s, "adq");
  return (
    <Preguntas
      s={s}
      juego="adivina"
      emoji="🎭"
      titulo="Adivina quién"
      base={10}
      como={["Aparecen frases anónimas escritas por agentes del grupo.", "Adivina quién escribió cada una.", "+10 por participar · +5 por cada acierto."]}
      items={tres.map((b) => ({ texto: `“${b.frase}”`, correcto: b.id }))}
    />
  );
}

export function CazaTraidor({ s }: P) {
  const juego = "traidor";
  const jugado = hecho<{ voto: string }>(s, juego);
  const sospechosos = [bot(s.traitor), ...BOTS.filter((b) => b.id !== s.traitor).slice(0, 3)].sort((a, b) => rnd(s, `trd:${a.id}`) - rnd(s, `trd:${b.id}`));
  const respuestas = ["Respondió que Doble Ají odia el ají 🤨", "Dijo que La Infiltrada nunca responde el chat", "Eligió a Agente Rocoto como el más madrugador", "Respondió que nadie llega tarde nunca"];
  return (
    <Marco
      juego={juego}
      emoji="🔍"
      titulo="Caza al traidor"
      jugado={Boolean(jugado)}
      como={[
        "Hoy un agente fue el saboteador: su misión era responder mal a propósito en la trivia.",
        "Mira las respuestas sospechosas y vota quién crees que fue.",
        "+10 por votar · +20 si el grupo descubre al traidor.",
      ]}
    >
      {jugado ? (
        jugado.voto === s.traitor ? (
          <Resultado>
            ¡Lo descubriste! El traidor era {nombre(s, s.traitor)} 🕵️ <Puntos n={30} />
          </Resultado>
        ) : (
          <Resultado tipo="mal">
            Fallaste: el traidor era <b>{nombre(s, s.traitor)}</b>. <Puntos n={10} />
          </Resultado>
        )
      ) : (
        sospechosos.map((b, i) => (
          <Opcion key={b.id} onClick={() => completar(juego, { voto: b.id }, b.id === s.traitor ? 30 : 10, "Caza al traidor")}>
            <Agente avatar={b.avatar} nombre={b.codename} sub={respuestas[i]} />
          </Opcion>
        ))
      )}
    </Marco>
  );
}

export function MemeSecreto({ s }: P) {
  const juego = "meme";
  const jugado = hecho<boolean>(s, juego);
  const [esperando, setEsperando] = useState(false);
  const receptor = bot(s.myReceiver);
  useEffect(() => {
    if (!esperando) return;
    const t = window.setTimeout(() => completar(juego, true, 15, "Meme al amigo secreto"), 1600);
    return () => window.clearTimeout(t);
  }, [esperando]);
  return (
    <Marco
      juego={juego}
      emoji="😂"
      titulo="Meme al amigo secreto"
      jugado={Boolean(jugado)}
      como={[
        `Mándale por privado un meme navideño a quien te toca regalar (${receptor.codename}), SIN firmarlo.`,
        "Toca «Ya se lo mandé». A tu amigo secreto le llega «¿alguien te mandó un meme?» y confirma.",
        "+15 cuando confirma.",
      ]}
    >
      {jugado ? (
        <Resultado>
          {receptor.codename} confirmó: “alguien me mandó un meme 😂”. <Puntos n={15} />
        </Resultado>
      ) : esperando ? (
        <Resultado tipo="info">⏳ Esperando que {receptor.codename} confirme…</Resultado>
      ) : (
        <Boton onClick={() => setEsperando(true)}>📱 Ya se lo mandé por WhatsApp</Boton>
      )}
    </Marco>
  );
}
