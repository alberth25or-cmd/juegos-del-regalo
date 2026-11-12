import { Suspense } from "react";
import { FichaAmigoSecreto } from "@/components/stages/FichaAmigoSecreto";
import { AGENTES, DIA, YO } from "@/components/stages/datosEjemplo";
import { fichaAmigo } from "@/lib/server/casas";
import { cargarCasas } from "../../cargar";
import { NoAbierta } from "../../NoAbierta";

const amigo = AGENTES.find((a) => a.alias === "Agente Mazamorra")!;

export default function AmigoSecretoPage() {
  return (
    <main className="px-4 pb-48 pt-8">
      <Suspense fallback={null}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  const c = await cargarCasas();
  if (c.tipo === "demo") return <Ejemplo />;
  if (c.tipo !== "real" || !c.estado.empezado) return <NoAbierta carga={c} />;
  const f = await fichaAmigo(c.yo);
  if (!f) return <NoAbierta carga={c} texto="No entraste al sorteo: tu ficha no estaba lista cuando el organizador apretó Empezar." />;
  return (
    <FichaAmigoSecreto
      dia={f.dia}
      saldoInicial={f.monedas}
      presupuesto={c.estado.sala.presupuesto}
      real={{ final: f.final, gratisHoy: f.gratisHoy, destacadas: f.destacadas, bonitas: f.bonitas, juegaPicante: f.juegaPicante }}
      f={{ alias: f.alias, avatar: f.avatar, regalos: f.regalos, datos: f.datos, respuestas: f.respuestas, abiertas: [] }}
    />
  );
}

function Ejemplo() {
  return (
    <FichaAmigoSecreto
      dia={DIA.dia}
      saldoInicial={YO.monedas}
      f={{
        alias: amigo.alias,
        avatar: amigo.avatar,
        regalos: ["Taza térmica", "Libro de cocina peruana", "Audífonos inalámbricos", "Caja de chocolates"],
        datos: [
          { label: "Género", valor: "Mujer" },
          { label: "Lentes", valor: "Sí" },
          { label: "Estatura", valor: "Medio" },
          { label: "Cabello", valor: "Largo" },
          { label: "La delata", valor: "Siempre llega con café" },
        ],
        respuestas: [
          { id: "c1", casa: 6, picor: 1, pregunta: "¿Qué lugar del mundo sueñas con conocer?", respuesta: "Japón en primavera, con los cerezos en flor" },
          { id: "c2", casa: 6, picor: 1, pregunta: "¿Qué pequeño lujo disfrutas sin sentir culpa?", respuesta: "Un café de especialidad los domingos" },
          { id: "m1", casa: 2, picor: 1, pregunta: "¿Qué es lo primero que se acaba en una fiesta navideña?", respuesta: "La paciencia", igualQue: 0.3 },
          { id: "a1", casa: 3, picor: 2, pregunta: "¿Cuántas parejas has tenido?", respuesta: "3", igualQue: 0.25 },
          { id: "p1", casa: 4, picor: 2, pregunta: "¿Tuviste una cita esta semana?", respuesta: "No", igualQue: 0.75 },
          { id: "m2", casa: 2, picor: 1, pregunta: "¿Cuál es el peor regalo de todos?", respuesta: "Medias", igualQue: 0.55 },
          { id: "a2", casa: 3, picor: 2, pregunta: "¿Cuántas veces viste esta semana al amor de tu vida?", respuesta: "Ninguna", igualQue: 0.4 },
          { id: "p2", casa: 4, picor: 3, pregunta: "¿Le has escrito a tu ex este año?", respuesta: "Sí", igualQue: 0.2 },
          { id: "a3", casa: 3, picor: 1, pregunta: "¿Tu primer beso fue en el colegio?", respuesta: null },
          { id: "m3", casa: 2, picor: 1, pregunta: "¿Quién se duerme primero en Navidad?", respuesta: "El abuelo", igualQue: 0.7 },
          { id: "a4", casa: 3, picor: 3, pregunta: "¿Sigues a tu ex en redes?", respuesta: "Sí, y miro sus historias", igualQue: 0.1 },
          { id: "p3", casa: 4, picor: 2, pregunta: "¿Mentiste en este juego?", respuesta: null },
          { id: "p4", casa: 4, picor: 3, pregunta: "¿Has stalkeado a alguien de este grupo?", respuesta: "Sí", igualQue: 0.15 },
        ],
        abiertas: ["m1", "a1", "p1"],
      }}
    />
  );
}
