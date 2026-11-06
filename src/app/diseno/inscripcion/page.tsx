import { FichaInscripcion } from "@/components/stages/FichaInscripcion";
import { SALA, YO } from "@/components/stages/datosEjemplo";

export default function InscripcionDiseno() {
  return (
    <main className="px-4 pt-8">
      <FichaInscripcion alias={YO.alias} presupuesto={SALA.presupuesto} />
    </main>
  );
}
