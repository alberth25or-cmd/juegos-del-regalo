import Link from "next/link";
import { Suspense } from "react";
import { AldeaStages } from "@/components/stages/AldeaStages";
import { ArbolEspera } from "@/components/stages/ArbolEspera";
import { AvisoFisgoneo } from "@/components/stages/AvisoFisgoneo";
import { BarraAgente } from "@/components/stages/BarraAgente";
import { AGENTES, DIA, faltanHoy, FISGONEOS_HOY, PUESTO, STAGES, YO, type Agente } from "@/components/stages/datosEjemplo";
import { agentesReales, casasReales } from "@/components/stages/real";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cargarCasas } from "./cargar";

/** Pantalla principal: la aldea de casas (datos reales con sesión; ejemplo sin sesión). */
export default function PantallaPrincipal() {
  return (
    <Suspense fallback={<p className="px-4 pt-16 text-center text-[1.1rem] font-bold text-[var(--hielo)]">Encendiendo las casas…</p>}>
      <Aldea />
    </Suspense>
  );
}

async function Aldea() {
  const c = await cargarCasas();

  if (c.tipo === "error") return <Aviso titulo="No pudimos cargar tus casas" texto="El servidor está ocupado. Recarga la página en unos segundos." />;
  if (c.tipo === "pendiente")
    return <Aviso titulo={`Hola, ${c.yo.displayName}`} texto="El organizador todavía tiene que aprobar tu ingreso. Apenas lo haga, aquí verás tus casas." />;

  if (c.tipo === "demo") {
    const faltan = STAGES.reduce((t, s) => t + faltanHoy(s), 0);
    return (
      <>
        <div className="relative z-[3] bg-[var(--oro)] px-4 py-2 text-center text-[0.9rem] font-extrabold text-[var(--tinta)]">
          Vista de ejemplo ·{" "}
          <Link href="/inicio" className="underline">
            entra con tu usuario para jugar
          </Link>
        </div>
        <BarraAgente yo={YO} puesto={PUESTO} agentes={AGENTES} stages={STAGES} />
        <main>
          <AvisoFisgoneo veces={FISGONEOS_HOY} />
          <AldeaStages stages={STAGES} yo={YO} subtitulo={`Día ${DIA.dia} de ${DIA.total} · Te faltan ${faltan} de hoy`} titulo="Hoy hay preguntas nuevas en cada casa" />
        </main>
      </>
    );
  }

  const e = c.estado;
  const yo: Agente = { alias: e.yo.alias, avatar: e.yo.avatar as Agente["avatar"], monedas: e.yo.monedas, hoy: [], yo: true };

  // Antes del "Empezar": ficha y árbol de espera.
  if (!e.empezado) {
    const inscritos: Agente[] = e.arbol.inscritos.map((a) => ({ alias: a.alias, avatar: a.avatar as Agente["avatar"], monedas: 0, hoy: [], yo: a.yo }));
    return (
      <main className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 pb-56 pt-6 lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:pt-10">
        {inscritos.length > 0 && <ArbolEspera agentes={inscritos} capacidad={e.arbol.capacidad} />}
        <section className="clay w-full max-w-sm p-6 text-center lg:text-left">
          <p className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-[var(--verde)]">Sala de espera · {e.yo.alias}</p>
          <h1 className="f-titulo mt-1 text-[2rem] font-semibold leading-tight [text-wrap:balance]">{e.yo.tieneFicha ? "¡Ya estás en el árbol!" : "Primero, tu ficha"}</h1>
          <p className="mt-3 text-[var(--tinta-suave)]">
            {e.yo.tieneFicha
              ? `Van ${inscritos.length} agentes con ficha. Cuando el organizador apriete "Empezar" se hace el sorteo y se abren todas las casas.`
              : "Tus opciones de regalo y unas pistas para reconocerte. Sin ficha no entras al sorteo del amigo secreto."}
          </p>
          <Link href="/diseno/inscripcion" className={`boton mt-5 w-full ${e.yo.tieneFicha ? "claro" : ""}`}>
            {e.yo.tieneFicha ? "Editar mi ficha" : "Llenar mi ficha"}
          </Link>
          {e.yo.admin && (
            <Link href="/diseno/organizador" className="boton verde mt-3 w-full">
              Panel del organizador
            </Link>
          )}
        </section>
      </main>
    );
  }

  const stages = casasReales(e);
  const faltan = stages.reduce((t, s) => t + faltanHoy(s), 0);
  return (
    <>
      <BarraAgente yo={yo} puesto={e.yo.puesto} agentes={agentesReales(e)} stages={stages} />
      <main>
        {e.capsula.abierta && e.capsula.recibida && (
          <Link href="/diseno/capsula" className="clay relative z-[2] mx-auto mt-3 flex max-w-[560px] items-center gap-3 !rounded-[18px] px-4 py-3 font-bold">
            <span className="text-[1.6rem]" aria-hidden>
              💌
            </span>
            Tu amigo secreto te dejó un mensaje en la cápsula del tiempo. ¡Ábrelo!
          </Link>
        )}
        {!e.capsula.abierta && e.yo.tieneAmigo && !e.capsula.escrita && (
          <Link href="/diseno/capsula" className="relative z-[2] mx-auto mt-3 flex max-w-[560px] items-center gap-2 px-4 text-[0.9rem] font-bold text-[var(--hielo)] underline">
            💌 Déjale un mensaje a tu amigo secreto en la cápsula del tiempo (se abre el día {e.capsula.abreDia})
          </Link>
        )}
        <AvisoFisgoneo veces={e.fisgoneosHoy} />
        <AldeaStages
          stages={stages}
          yo={yo}
          subtitulo={`Día ${e.dia} de ${e.totalDias} · ${faltan ? `Te faltan ${faltan} de hoy` : "Estás al día"}`}
          titulo={faltan ? "Hoy hay preguntas nuevas en cada casa" : "¡Al día! Mañana salen más"}
        />
      </main>
    </>
  );
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main className="px-4 pb-56 pt-10">
      <section className="clay mx-auto max-w-md p-7 text-center" role="status">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff1d6]">
          <PixelIcon name="clock" size={34} />
        </span>
        <h1 className="f-titulo mt-3 text-[1.8rem] font-semibold">{titulo}</h1>
        <p className="mt-2 text-[var(--tinta-suave)]">{texto}</p>
      </section>
    </main>
  );
}
