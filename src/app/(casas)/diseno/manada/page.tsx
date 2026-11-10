import { Suspense } from "react";
import { JuegoManada } from "@/components/stages/JuegoManada";
import { cargarCasas } from "../../cargar";
import { NoAbierta } from "../../NoAbierta";

export default function ManadaPage() {
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
  if (c.tipo === "demo") return <JuegoManada />;
  if (c.tipo !== "real" || !c.estado.empezado || !c.estado.manada) return <NoAbierta carga={c} />;
  const m = c.estado.manada;
  return <JuegoManada real={{ dia: c.estado.dia, pregunta: { id: m.id, texto: m.texto, opciones: m.opciones }, mia: m.estado === "respondida" ? (m.mia ?? "-1") : null }} />;
}
