import { BarraAgente } from "@/components/stages/BarraAgente";
import { AldeaStages } from "@/components/stages/AldeaStages";
import { AvisoFisgoneo } from "@/components/stages/AvisoFisgoneo";
import { AGENTES, DIA, faltanHoy, FISGONEOS_HOY, PUESTO, STAGES, YO } from "@/components/stages/datosEjemplo";

export default function PantallaPrincipalDiseno() {
  const faltan = STAGES.reduce((t, s) => t + faltanHoy(s), 0);
  return (
    <>
      <BarraAgente yo={YO} puesto={PUESTO} agentes={AGENTES} stages={STAGES} />
      <main>
        <AvisoFisgoneo veces={FISGONEOS_HOY} />
        <AldeaStages
          stages={STAGES}
          yo={YO}
          subtitulo={`Día ${DIA.dia} de ${DIA.total} · ${faltan ? `Te faltan ${faltan} de hoy` : "Estás al día"}`}
          titulo={faltan ? "Hoy hay preguntas nuevas en cada casa" : "¡Al día! Mañana salen más"}
        />
      </main>
    </>
  );
}
