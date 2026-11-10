import { Suspense } from "react";
import { CapsulaTiempo } from "@/components/stages/CapsulaTiempo";
import { capsulas, fichaAmigo } from "@/lib/server/casas";
import { cargarCasas } from "../../cargar";
import { NoAbierta } from "../../NoAbierta";

export default function CapsulaPage() {
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
    return <CapsulaTiempo datos={{ abreDia: 30, dia: 7, abierta: false, mio: null, recibido: null, para: "Agente Mazamorra" }} />;
  if (c.tipo !== "real" || !c.estado.empezado) return <NoAbierta carga={c} />;
  const [cap, amigo] = await Promise.all([capsulas(c.yo), fichaAmigo(c.yo)]);
  return <CapsulaTiempo real datos={{ ...cap, para: amigo?.alias ?? null }} />;
}
