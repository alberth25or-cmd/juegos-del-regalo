import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/acceso/Shell";
import { EntrarForm } from "@/components/acceso/Formularios";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <Shell title="Entrar con tu código" kicker="Otro celular">
      <p className="mb-4 text-[0.95rem] text-[var(--ink-soft)]">
        Usa el código de rescate que te dimos al unirte y tu PIN de 4 números.
      </p>
      <EntrarForm />
      <p className="mt-5 text-[0.88rem]">
        ¿Primera vez? Abre el enlace de invitación que te mandaron por WhatsApp, o{" "}
        <Link href="/crear" className="font-pixel underline">
          crea un grupo nuevo
        </Link>
        .
      </p>
    </Shell>
  );
}
