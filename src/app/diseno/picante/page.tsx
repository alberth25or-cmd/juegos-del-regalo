import { JuegoPregunta } from "@/components/stages/JuegoPregunta";
import { YO } from "@/components/stages/datosEjemplo";

export default function PicanteDiseno() {
  return (
    <main className="px-4 pb-48 pt-6">
      <JuegoPregunta
        casa={4}
        saldoInicial={YO.monedas}
        pasesUsadosInicial={5}
        preguntas={[{ texto: "¿Le has escrito a tu ex este año?" }, { texto: "¿Has stalkeado a alguien de este grupo?" }]}
      />
    </main>
  );
}
