import { BarraAgente } from "@/components/stages/BarraAgente";
import { CarruselStages } from "@/components/stages/CarruselStages";
import { AGENTES, DIA, PUESTO, STAGES, YO } from "@/components/stages/datosEjemplo";

export default function PantallaPrincipalDiseno() {
  return (
    <>
      <BarraAgente yo={YO} puesto={PUESTO} agentes={AGENTES} stages={STAGES} />
      <main>
        <CarruselStages stages={STAGES} encabezado={`STAGE ${DIA.stage} DE ${DIA.de} · DÍA ${DIA.dia} DE ${DIA.total}`} />
      </main>
    </>
  );
}
