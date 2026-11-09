import { Suspense } from "react";
import { JuegoPregunta } from "@/components/stages/JuegoPregunta";
import { PreguntasCasa } from "@/components/stages/PreguntasCasa";
import { YO } from "@/components/stages/datosEjemplo";
import { cargarCasas } from "../../cargar";
import { NoAbierta } from "../../NoAbierta";

export default function Pagina() {
  return (
    <main className="px-4 pb-48 pt-6">
      <Suspense fallback={null}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  const c = await cargarCasas();
  if (c.tipo === "demo") return <JuegoPregunta casa={4} saldoInicial={YO.monedas} pasesUsadosInicial={5} preguntas={[{ texto: "¿Le has escrito a tu ex este año?" }, { texto: "¿Has stalkeado a alguien de este grupo?" }]} />;
  if (c.tipo !== "real" || !c.estado.empezado) return <NoAbierta carga={c} />;
  return <PreguntasCasa casa={4} inicial={c.estado} />;
}
