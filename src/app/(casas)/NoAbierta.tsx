import Link from "next/link";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Carga } from "./cargar";

/** Mensaje claro cuando una casa todavía no se puede usar (sin sesión aprobada o antes del "Empezar"). */
export function NoAbierta({ carga, texto }: { carga: Carga; texto?: string }) {
  const t =
    texto ??
    (carga.tipo === "error"
      ? "El servidor está ocupado. Recarga en unos segundos."
      : carga.tipo === "pendiente"
        ? "El organizador todavía tiene que aprobar tu ingreso."
        : 'Las casas se abren cuando el organizador aprieta "Empezar".');
  return (
    <section className="clay mx-auto max-w-md p-7 text-center" role="status">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff1d6]">
        <PixelIcon name="lock" size={30} />
      </span>
      <p className="mt-3 text-[1.05rem] font-bold">{t}</p>
      <Link href="/" className="boton claro mt-5 w-full">
        Volver a las casas
      </Link>
    </section>
  );
}
