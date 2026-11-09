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
  if (c.tipo === "demo") return <JuegoPregunta casa={3} saldoInicial={YO.monedas} pasesUsadosInicial={2} preguntas={[{ texto: "¿Cuántas parejas has tenido?" }, { texto: "¿Cuántas veces viste esta semana al amor de tu vida?" }]} />;
  if (c.tipo !== "real" || !c.estado.empezado) return <NoAbierta carga={c} />;
  return <PreguntasCasa casa={3} inicial={c.estado} />;
}
