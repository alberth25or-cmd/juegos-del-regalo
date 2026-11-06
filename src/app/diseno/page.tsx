import { BarraAgente } from "@/components/stages/BarraAgente";
import { CarruselStages } from "@/components/stages/CarruselStages";
import { AGENTES, DIA, PUESTO, STAGES, YO } from "@/components/stages/datosEjemplo";

export default function PantallaPrincipalDiseno() {
  return (
    <>
      <BarraAgente yo={YO} puesto={PUESTO} agentes={AGENTES} stages={STAGES} />
      <main>
        <CarruselStages stages={STAGES} subtitulo={`Stage ${DIA.stage} de ${DIA.de} · Día ${DIA.dia} de ${DIA.total}`} titulo="Abre el regalo de hoy" />
      </main>
    </>
  );
}
