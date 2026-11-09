import { BarraAgente } from "@/components/stages/BarraAgente";
import { AldeaStages } from "@/components/stages/AldeaStages";
import { AGENTES, DIA, PUESTO, STAGES, YO } from "@/components/stages/datosEjemplo";

export default function PantallaPrincipalDiseno() {
  return (
    <>
      <BarraAgente yo={YO} puesto={PUESTO} agentes={AGENTES} stages={STAGES} />
      <main>
        <AldeaStages stages={STAGES} yo={YO} subtitulo={`Stage ${DIA.stage} de ${DIA.de} · Día ${DIA.dia} de ${DIA.total}`} titulo="Abre el regalo de hoy" />
      </main>
    </>
  );
}
