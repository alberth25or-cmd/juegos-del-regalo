import { Suspense } from "react";
import { FichaInscripcion } from "@/components/stages/FichaInscripcion";
import { SALA, YO } from "@/components/stages/datosEjemplo";
import { miFicha } from "@/lib/server/casas";
import { cargarCasas } from "../../cargar";
import { NoAbierta } from "../../NoAbierta";

export default function InscripcionPage() {
  return (
    <main className="px-4 pt-8">
      <Suspense fallback={null}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  const c = await cargarCasas();
  if (c.tipo === "demo") return <FichaInscripcion alias={YO.alias} presupuesto={SALA.presupuesto} />;
  if (c.tipo !== "real") return <NoAbierta carga={c} />;
  return <FichaInscripcion alias={c.estado.yo.alias} presupuesto={SALA.presupuesto} real={{ inicial: await miFicha(c.yo) }} />;
}
