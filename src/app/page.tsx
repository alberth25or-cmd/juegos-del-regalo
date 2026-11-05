import { Suspense } from "react";
import { HomeStage } from "@/components/home/HomeStage";
import { Cabecera, Pildora } from "@/components/home/HomeHud";
import { CabeceraDatos, PildoraDatos, PlazaCargando, PlazaCentral } from "@/components/home/Datos";
import { Modules } from "@/components/modules/Modules";

/**
 * Snowville: la aldea animada (estática, carga al instante) + la plaza central
 * con los datos del jugador (en streaming) + las zonas (HTML del servidor).
 */
export default function Home() {
  return (
    <>
      <HomeStage
        header={
          <Suspense fallback={<Cabecera r={null} />}>
            <CabeceraDatos />
          </Suspense>
        }
        pill={
          <Suspense fallback={<Pildora e={{ tipo: "visitante" }} />}>
            <PildoraDatos />
          </Suspense>
        }
      />
      <Suspense fallback={<PlazaCargando />}>
        <PlazaCentral />
      </Suspense>
      <Modules />
    </>
  );
}
