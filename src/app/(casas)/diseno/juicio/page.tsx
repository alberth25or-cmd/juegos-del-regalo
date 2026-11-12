import { Suspense } from "react";
import { JuegoJuicio } from "@/components/stages/JuegoJuicio";
import { premios } from "@/lib/server/casas";
import { cargarCasas } from "../../cargar";
import { NoAbierta } from "../../NoAbierta";

export default function JuicioPage() {
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
  if (c.tipo === "demo") return <JuegoJuicio datos={EJEMPLO} />;
  if (c.tipo !== "real" || !c.estado.empezado) return <NoAbierta carga={c} />;
  const e = c.estado;
  return <JuegoJuicio real datos={{ dia: e.dia, caso: e.juicio, ayer: e.juicioAyer, premios: await premios(c.yo.seasonId), final: e.fichaAbierta }} />;
}

const EJEMPLO = {
  dia: 7,
  caso: { id: "j31", texto: "Alguien descubrió que la pareja de su mejor amigo le es infiel y decidió no decirle nada \"para no meterse\".", mia: null, estado: null },
  ayer: { texto: "Alguien perdonó una infidelidad y volvió como si nada.", culpable: 8, inocente: 10, veredicto: "Inocente", mia: "Culpable" },
  premios: [
    { titulo: "El más chismoso", emoji: "👀", detalle: "Abrió 9 sobres de su amigo secreto", ganadores: ["Agente Picarón"], valor: 9 },
    { titulo: "El que más pasó", emoji: "🙈", detalle: "Pasó 4 preguntas", ganadores: ["Agente Cau Cau"], valor: 4 },
    { titulo: "Siempre al día", emoji: "📅", detalle: "6 días con todo completo", ganadores: ["Agente Rocoto", "Agente Causa"], valor: 6 },
    { titulo: "El rebelde del jurado", emoji: "⚖️", detalle: "Votó 3 veces contra el jurado", ganadores: ["Agente Suspiro"], valor: 3 },
  ],
  final: false,
};
