import Link from "next/link";
import { cache } from "react";
import { arcoDelDia, type EstadoTemporada } from "@/features/season/calendario";
import { contextoDelDia, fraseDe, type NpcId } from "@/features/contenido/npcs";
import { GIFT_CATCHER } from "@/features/scoring/reglas";
import { NpcSprite, Avatar } from "@/components/rpg/PixelSprite";
import { DialogoNpc } from "@/components/plaza/DialogoNpc";
import { Noticias } from "@/components/plaza/Noticias";
import { Aviso } from "@/components/ui/Pantalla";
import { EnlaceInvitacion } from "@/components/acceso/Formularios";
import { equiposDeTemporada, eventosDeTemporada, jugadoresDeTemporada, miGiftCatcher, noticias, rankingEquipos, recordsGiftCatcher } from "@/lib/server/consultas";
import { hasDatabase } from "@/lib/server/db";
import { estadoDe, jugadorActual } from "@/lib/server/sesion";

/**
 * Partes de la portada que dependen del jugador. Van dentro de <Suspense>
 * y comparten las mismas consultas por request (React `cache`).
 */

const datosJugador = cache(async () => {
  if (!hasDatabase()) return null;
  const yo = await jugadorActual();
  if (!yo) return null;
  const [jugadores, equipos, gift] = await Promise.all([jugadoresDeTemporada(yo.seasonId), equiposDeTemporada(yo.seasonId), miGiftCatcher(yo.id)]);
  const ahora = new Date();
  const estado = estadoDe(yo, ahora);
  const fila = jugadores.find((j) => j.id === yo.id);
  return { yo, jugadores, equipos, gift, estado, fila, ahora };
});

function diaTexto(e: EstadoTemporada, prueba = false) {
  if (prueba && e.fase === "en-curso") return `🧪 Prueba · día ${e.dia}`;
  if (e.fase === "pretemporada") return `⏳ Faltan ${e.faltanDias} día${e.faltanDias === 1 ? "" : "s"}`;
  if (e.fase === "terminada") return "🏁 Temporada terminada";
  return `🎄 Día ${e.dia} de ${e.totalDias}`;
}

// ------------------------------------------------------------- plaza central
const ORDEN_NPC: NpcId[] = ["santa", "duende", "rudolf", "auditor", "muneco"];

function Seccion({ children }: { children: React.ReactNode }) {
  return (
    <section id="plaza" className="relative z-10 scroll-mt-28 px-4 pb-14 pt-10" style={{ background: "linear-gradient(180deg, #fff6e5 0%, #fbe9c9 100%)" }} aria-labelledby="plaza-titulo">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <header className="text-center">
          <span className="px-chip" style={{ ["--chip" as string]: "var(--cream)" }}>
            Snowville · Centro
          </span>
          <h2 id="plaza-titulo" className="zone-title mt-3 font-pixel">
            Noticias y progreso
          </h2>
        </header>
        {children}
      </div>
    </section>
  );
}

export function PlazaCargando() {
  return (
    <Seccion>
      <div className="px-box h-40 p-4" style={{ animation: "glow-pulse 1.2s steps(3) infinite" }}>
        <p className="font-pixel text-[var(--ink-soft)]">Santa está buscando sus llaves…</p>
      </div>
    </Seccion>
  );
}

export async function PlazaCentral() {
  if (!hasDatabase()) {
    return (
      <Seccion>
        <Aviso tono="error">El juego todavía no tiene base de datos configurada.</Aviso>
      </Seccion>
    );
  }
  const d = await datosJugador();
  if (!d) return <Bienvenida />;

  const { yo, estado, fila, gift, ahora } = d;
  const dia = estado.fase === "en-curso" ? estado.dia : estado.fase === "terminada" ? estado.totalDias : 0;
  const semilla = Number(ahora.toISOString().slice(0, 10).replace(/-/g, ""));
  const ctx = yo.status === "pending" ? "pendiente" : !yo.teamId && yo.status === "active" ? "sinEquipo" : contextoDelDia(dia);
  const lineas = ORDEN_NPC.map((npc, k) => ({ npc, texto: fraseDe(npc, ctx, semilla + k * 97) }));
  const [news, eventos, records] = await Promise.all([noticias(yo.seasonId, 8), eventosDeTemporada(yo.seasonId), recordsGiftCatcher(yo.seasonId, 5)]);
  const equipos = rankingEquipos(d.equipos, d.jugadores);
  const miEquipo = equipos.find((e) => e.id === yo.teamId);
  const proximo = eventos.find((e) => e.day >= Math.max(1, dia));
  const arco = arcoDelDia(Math.max(1, dia));

  return (
    <Seccion>
      {yo.prueba && (
        <Aviso>
          🧪 <b>Temporada de prueba.</b> Aquí todo vale para probar: sin topes diarios y el organizador puede simular cualquier día. Las monedas no pasan a la temporada real.
        </Aviso>
      )}
      <Link href="/mundo" className="px-box shine flex items-center gap-3 p-3" style={{ ["--bg" as string]: "#1b1f4a", color: "var(--cream)" }}>
        <span className="text-3xl" aria-hidden>
          🗺️
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block font-pixel text-lg" style={{ color: "var(--gold)" }}>
            Entrar a Snowville
          </span>
          <span className="block text-[0.8rem] opacity-85">Camina, entra a las casas y mira quién más está conectado.</span>
        </span>
        <span className="font-pixel text-xl">▶</span>
      </Link>
      <DialogoNpc lineas={lineas} />

      {yo.role === "admin" && (
        <div className="px-box flex flex-col gap-2 p-3" style={{ ["--bg" as string]: "var(--cream-2)" }}>
          <div className="flex items-center justify-between">
            <span className="font-pixel">Invita a tus amigos</span>
            <Link href="/admin" className="px-chip" style={{ ["--chip" as string]: "var(--gold)" }}>
              Panel →
            </Link>
          </div>
          <EnlaceInvitacion codigo={yo.inviteCode} compacto />
        </div>
      )}

      {/* Temporada */}
      <div className="px-box p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-pixel text-lg">{estado.fase === "pretemporada" ? "Pretemporada" : arco.titulo}</span>
          <span className="px-chip !text-[0.72rem]" style={{ ["--chip" as string]: "var(--mint)" }}>
            {diaTexto(estado, yo.prueba)}
          </span>
        </div>
        <p className="mt-1 text-[0.85rem] text-[var(--ink-soft)]">
          {estado.fase === "pretemporada"
            ? "Las monedas cuentan desde el 25 de noviembre. Mientras tanto puedes practicar los minijuegos."
            : arco.resumen}
        </p>
        <div className="mt-3 grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[3px]" aria-label={`Día ${dia} de 30`}>
          {Array.from({ length: 30 }, (_, k) => {
            const ev = eventos.some((e) => e.day === k + 1);
            return (
              <span
                key={k}
                className="block h-3"
                style={{
                  background: k + 1 < dia ? "var(--cherry)" : k + 1 === dia ? "var(--gold)" : ev ? "var(--lavender)" : "#e4dccb",
                  animation: k + 1 === dia ? "glow-pulse 1s steps(2) infinite" : undefined,
                }}
              />
            );
          })}
        </div>
        {proximo && (
          <p className="mt-2 text-[0.82rem]">
            <b>Día {proximo.day}:</b> {proximo.title} — <span className="text-[var(--ink-soft)]">{proximo.description}</span>
          </p>
        )}
      </div>

      {/* Mi progreso */}
      <div className="px-box flex items-center gap-3 p-3">
        <span className="flex h-20 w-16 shrink-0 items-end justify-center bg-[var(--sky)]" style={{ boxShadow: "0 0 0 2px var(--ink)" }}>
          <span className="anim-bob">
            <Avatar config={yo.avatar} size={48} />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-pixel text-lg">{yo.displayName}</span>
            {fila && <span className="font-pixel text-[0.85rem]">Puesto #{fila.rank}</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[0.75rem]">
            <span className="px-chip" style={{ ["--chip" as string]: "var(--gold)" }}>
              🪙 {fila?.monedas ?? 0} monedas
            </span>
            {miEquipo ? (
              <span className="px-chip" style={{ ["--chip" as string]: miEquipo.color, color: "#fff" }}>
                {miEquipo.emblem} {miEquipo.name} · #{miEquipo.rank}
              </span>
            ) : (
              <span className="px-chip">Sin equipo aún</span>
            )}
          </div>
          <p className="mt-1.5 text-[0.75rem] text-[var(--ink-soft)]">
            Gift Catcher hoy: {gift.monedasHoy}/{GIFT_CATCHER.topeDiario} monedas · récord {gift.record}
          </p>
        </div>
      </div>

      {/* Noticias */}
      <div className="px-box p-4">
        <p className="mb-2 font-pixel text-lg">📰 El Diario de Snowville</p>
        <Noticias iniciales={news} ahora={ahora.getTime()} />
      </div>

      {/* Récords */}
      {records.length > 0 && (
        <div className="px-box p-4">
          <p className="mb-2 font-pixel text-lg">🏆 Récords de Gift Catcher</p>
          <ol className="flex flex-col gap-1.5">
            {records.map((r, k) => (
              <li key={k} className="flex items-center gap-2">
                <span className="w-5 font-pixel">{k + 1}.</span>
                <Avatar config={r.avatar} size={22} />
                <span className="min-w-0 flex-1 truncate">{r.nombre}</span>
                <span className="font-pixel tabular-nums">{r.record}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Seccion>
  );
}

/** Plaza para visitantes: qué es esto y cómo entrar. */
function Bienvenida() {
  return (
    <Seccion>
      <DialogoNpc
        lineas={[
          { npc: "santa", texto: "Bienvenido a Snowville. La fábrica está en quiebra, los duendes en huelga y necesito 20 voluntarios que no cobren." },
          { npc: "duende", texto: "Son 30 días de juegos, votaciones y caos. Se juega desde el celular, unos minutos al día." },
          { npc: "rudolf", texto: "Hay 4 equipos. El que gana es el de mejor promedio. O sea, el mío." },
          { npc: "auditor", texto: "Cada punto queda registrado. Nadie hace trampa en mi turno." },
          { npc: "muneco", texto: "Si tienes un enlace de invitación, ábrelo. Si no… yo no te vi." },
        ]}
      />
      <Link href="/mundo" className="px-box shine flex items-center gap-3 p-3" style={{ ["--bg" as string]: "#1b1f4a", color: "var(--cream)" }}>
        <span className="text-3xl" aria-hidden>
          🗺️
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block font-pixel text-lg" style={{ color: "var(--gold)" }}>
            Entrar a Snowville
          </span>
          <span className="block text-[0.8rem] opacity-85">Camina, entra a las casas y mira quién más está conectado.</span>
        </span>
        <span className="font-pixel text-xl">▶</span>
      </Link>
      <div className="px-box flex flex-col gap-3 p-4">
        <p className="font-pixel text-lg">¿Cómo entro?</p>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-[0.9rem]">
          <li>Abre el enlace de invitación que te mandó el organizador.</li>
          <li>Crea tu personaje, tu usuario y un PIN de 4 números.</li>
          <li>Cuando el organizador te apruebe, ¡a jugar!</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <Link href="/entrar" className="px-btn flex-1" style={{ ["--bg" as string]: "var(--gold)" }}>
            Ya tengo usuario
          </Link>
          <Link href="/crear" className="px-btn flex-1" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
            Crear temporada
          </Link>
        </div>
        <Link href="/reglas" className="text-center text-[0.85rem] underline">
          Reglas, humor y privacidad
        </Link>
      </div>
      <div className="flex justify-center gap-1" aria-hidden>
        {ORDEN_NPC.map((n, k) => (
          <span key={n} className="anim-bob" style={{ animationDelay: `${k * 0.2}s` }}>
            <NpcSprite id={n} size={52} />
          </span>
        ))}
      </div>
    </Seccion>
  );
}
