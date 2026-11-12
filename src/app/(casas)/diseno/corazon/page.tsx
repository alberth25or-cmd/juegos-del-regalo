import { Suspense } from "react";
import { JuegoCorazon } from "@/components/stages/JuegoCorazon";
import { cargarCasas } from "../../cargar";
import { NoAbierta } from "../../NoAbierta";

export default function CorazonPage() {
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
  if (c.tipo === "demo")
    return (
      <JuegoCorazon
        datos={{
          dia: 7,
          fase: "normal",
          preguntas: [
            { id: "c12", texto: "¿Qué lugar del mundo sueñas con conocer?", mia: null, estado: null },
            { id: "c25", texto: "¿Qué pequeño lujo disfrutas sin sentir culpa?", mia: null, estado: null },
          ],
        }}
      />
    );
  if (c.tipo !== "real" || !c.estado.empezado) return <NoAbierta carga={c} />;
  return <JuegoCorazon real datos={{ dia: c.estado.dia, fase: c.estado.fase, preguntas: c.estado.corazon }} />;
}
