import type { Metadata } from "next";
import { Pantalla } from "@/components/ui/Pantalla";

export const metadata: Metadata = { title: "Reglas y privacidad" };

const SECCIONES: { t: string; items: string[] }[] = [
  {
    t: "Cómo se gana",
    items: [
      "Todo se gana en monedas, y el ranking es cuántas monedas tienes. No hay puntos ni XP aparte.",
      "En cada juego cuenta tu mejor resultado del día, con un tope diario. Repetir mejora tu récord, no tus monedas.",
      "Ranking de equipos = promedio de monedas por integrante activo. Cada persona cuenta lo mismo.",
      "Faltar un día no te quita nada de lo que ya ganaste.",
    ],
  },
  {
    t: "Juego limpio",
    items: [
      "El servidor revisa cada partida (duración y puntaje posible). Las partidas imposibles no cuentan.",
      "Las monedas quedan en un libro que nadie puede editar. Si el organizador corrige algo, queda registrado con su motivo.",
      "Gastar monedas (por ejemplo, para fisgonear en el juego del amigo secreto) te baja en el ranking: piénsalo antes.",
    ],
  },
  {
    t: "Humor con consentimiento",
    items: [
      "Humor negro y sátira, sí. Ataques por raza, origen, religión, orientación, identidad, discapacidad, salud, apariencia, dinero o familia, no.",
      "Nada de secretos reales, datos personales ni contenido íntimo.",
      "Roast Battle es voluntario: puedes desactivarlo en tu perfil y salir antes de enviar.",
      "Podrás reportar cualquier contenido; el organizador lo revisa y sus acciones quedan registradas.",
    ],
  },
  {
    t: "Privacidad",
    items: [
      "Guardamos solo lo necesario: tu nombre visible, usuario, avatar, PIN cifrado y tus resultados.",
      "Tu PIN se guarda cifrado; nadie lo puede leer, ni el organizador (solo reiniciarlo).",
      "El confesionario será anónimo para los jugadores, pero no frente a los registros técnicos ni al organizador. No escribas nada que no dirías en el grupo.",
      "Nada se publica fuera del grupo sin que tú lo elijas. Las tarjetas para compartir muestran tu nombre solo si lo permites.",
    ],
  },
];

export default function ReglasPage() {
  return (
    <Pantalla title="Reglas y privacidad" kicker="Letra pequeña (pero legible)" npc="auditor">
      <div className="flex flex-col gap-4">
        {SECCIONES.map((s) => (
          <section key={s.t}>
            <h2 className="font-pixel text-lg">{s.t}</h2>
            <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-[0.9rem]">
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
        <p className="px-hint">Temporada Christmas Chaos · 25 nov → 24 dic de 2026 · hora de Lima.</p>
      </div>
    </Pantalla>
  );
}
