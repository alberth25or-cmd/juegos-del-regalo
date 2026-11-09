import { JuegoPregunta } from "@/components/stages/JuegoPregunta";
import { YO } from "@/components/stages/datosEjemplo";

export default function AmorDiseno() {
  return (
    <main className="px-4 pb-48 pt-6">
      <JuegoPregunta
        casa={3}
        saldoInicial={YO.monedas}
        pasesUsadosInicial={2}
        preguntas={[{ texto: "¿Cuántas parejas has tenido?" }, { texto: "¿Cuántas veces viste esta semana al amor de tu vida?" }]}
      />
    </main>
  );
}
