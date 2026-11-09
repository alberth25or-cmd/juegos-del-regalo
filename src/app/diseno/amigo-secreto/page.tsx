import { FichaAmigoSecreto } from "@/components/stages/FichaAmigoSecreto";
import { AGENTES } from "@/components/stages/datosEjemplo";

const amigo = AGENTES.find((a) => a.alias === "Agente Mazamorra")!;

export default function AmigoSecretoDiseno() {
  return (
    <main className="px-4 pb-48 pt-8">
      <FichaAmigoSecreto
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
          amor: [
            { pregunta: "¿Cuántas parejas has tenido?", respuesta: "3" },
            { pregunta: "¿Cuántas veces viste esta semana al amor de tu vida?", respuesta: "Ninguna" },
            { pregunta: "¿Tu primer beso fue en el colegio?", respuesta: null },
          ],
          picante: [
            { pregunta: "¿Le has escrito a tu ex este año?", respuesta: "Sí" },
            { pregunta: "¿Tuviste una cita esta semana?", respuesta: "No" },
            { pregunta: "¿Mentiste en este juego?", respuesta: null },
          ],
        }}
      />
    </main>
  );
}
