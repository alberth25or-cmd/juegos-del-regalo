import Link from "next/link";
import { NpcSprite } from "@/components/rpg/PixelSprite";

export default function NoEncontrado() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#1b1f4a] px-4 pb-32">
      <div className="px-box flex max-w-sm flex-col items-center gap-3 p-5 text-center">
        <NpcSprite id="muneco" size={72} />
        <h1 className="font-pixel text-2xl">Aquí no hay nada</h1>
        <p className="text-[0.9rem]">Yo no estaba aquí. Tú tampoco. Esta página no existe.</p>
        <Link href="/" className="px-btn w-full" style={{ ["--bg" as string]: "var(--gold)" }}>
          Volver a la plaza
        </Link>
      </div>
    </main>
  );
}
