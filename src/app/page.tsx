import { HomeStage } from "@/components/home/HomeStage";
import { Modules } from "@/components/modules/Modules";

export default function Home() {
  return (
    <>
      <HomeStage />
      {/* Zonas: HTML del servidor, sin hidratar */}
      <Modules />
    </>
  );
}
