import { Suspense } from "react";
import { PanelCasas } from "@/components/stages/PanelCasas";
import { PanelOrganizador } from "@/components/stages/PanelOrganizador";
import { TablaPrecios } from "@/components/stages/TablaPrecios";
import { AGENTES, SALA } from "@/components/stages/datosEjemplo";
import { estadoOrganizador } from "@/lib/server/casas";
import { cargarCasas } from "../../cargar";
import { NoAbierta } from "../../NoAbierta";

// Usuarios de acceso de ejemplo, en otro orden que los alias: no se pueden relacionar.
const USUARIOS = ["ana.r", "bruno22", "carla_v", "dani", "eli.m", "fer", "gabo", "hugo.c", "iris", "javi", "kathy", "luis", "majo", "nico", "olga.p", "pepe", "quique", "rosa", "sebas", "tati"];

export default function OrganizadorPage() {
  return (
    <main className="px-4 pb-48 pt-8">
      <h1 className="f-titulo mx-auto mb-5 max-w-5xl text-[2.2rem] font-semibold">Panel del organizador</h1>
      <Suspense fallback={null}>
        <Contenido />
      </Suspense>
      <TablaPrecios />
    </main>
  );
}

async function Contenido() {
  const c = await cargarCasas();
  if (c.tipo === "demo") return <PanelOrganizador agentes={AGENTES.slice(0, 14)} usuarios={USUARIOS.slice(0, 14)} capacidadInicial={SALA.capacidad} />;
  if (c.tipo !== "real") return <NoAbierta carga={c} />;
  if (c.yo.role !== "admin") return <NoAbierta carga={c} texto="Este panel es solo para el organizador. Abajo puedes ver los precios del juego." />;
  return <PanelCasas estado={await estadoOrganizador(c.yo.seasonId)} dia={c.estado.dia} />;
}
