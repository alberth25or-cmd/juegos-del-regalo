import { FichaAmigoSecreto } from "@/components/stages/FichaAmigoSecreto";
import { AGENTES, DIA, YO } from "@/components/stages/datosEjemplo";

const amigo = AGENTES.find((a) => a.alias === "Agente Mazamorra")!;

export default function AmigoSecretoDiseno() {
  return (
    <main className="px-4 pb-48 pt-8">
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
          // shortcut: respuestas de ejemplo; `igualQue` = parte del grupo que respondió lo mismo.
          respuestas: [
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
    </main>
  );
}
