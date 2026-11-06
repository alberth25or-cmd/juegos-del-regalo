import { PanelOrganizador } from "@/components/stages/PanelOrganizador";
import { AGENTES, SALA } from "@/components/stages/datosEjemplo";

// Usuarios de acceso de ejemplo, en otro orden que los alias: no se pueden relacionar.
const USUARIOS = ["ana.r", "bruno22", "carla_v", "dani", "eli.m", "fer", "gabo", "hugo.c", "iris", "javi", "kathy", "luis", "majo", "nico", "olga.p", "pepe", "quique", "rosa", "sebas", "tati"];

export default function OrganizadorDiseno() {
  return (
    <main className="px-4 pb-48 pt-8">
      <h1 className="f-titulo mx-auto mb-5 max-w-5xl text-[2.2rem] font-semibold">Panel del organizador</h1>
      <PanelOrganizador agentes={AGENTES.slice(0, 14)} usuarios={USUARIOS.slice(0, 14)} capacidadInicial={SALA.capacidad} />
    </main>
  );
}
