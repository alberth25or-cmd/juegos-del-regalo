import { PixelIcon } from "@/components/ui/PixelIcon";
import { Cabeza } from "./Cabeza";

export interface DatosFicha {
  alias: string;
  avatar: unknown;
  regalos: string[];
  datos: { label: string; valor: string }[];
  amor: { pregunta: string; respuesta: string | null }[];
  picante: { pregunta: string; respuesta: "Sí" | "No" | null }[];
}

/** Expediente privado del amigo secreto: solo lo ve quien regala. `null` = "Pasó". */
export function FichaAmigoSecreto({ f }: { f: DatosFicha }) {
  return (
    <article className="px-box relative mx-auto max-w-xl overflow-hidden p-5 text-[var(--ink)] sm:p-7" style={{ ["--bg" as string]: "var(--cream)" }}>
      <p className="stamp-static absolute right-4 top-4 font-pixel text-[0.75rem] text-[var(--cta)] sm:text-[0.85rem]">PRIVADA Y CONFIDENCIAL</p>

      <header className="flex items-center gap-4 border-b-[3px] border-dashed border-[var(--ink)]/30 pb-4 pt-6 sm:pt-2">
        <span className="grid h-[76px] w-[76px] shrink-0 place-items-center bg-[var(--noche-2)]">
          <Cabeza config={f.avatar} size={56} />
        </span>
        <div>
          <p className="text-[0.85rem] text-[var(--ink-soft)]">Tu amigo secreto es</p>
          <h1 className="font-pixel text-[1.5rem] leading-tight">{f.alias}</h1>
          <p className="text-[0.85rem] text-[var(--ink-soft)]">El 24 dic dirás: &quot;mi regalo es para {f.alias}&quot;.</p>
        </div>
      </header>

      <Seccion icono="chest" titulo="Quiere uno de estos">
        <ol className="grid gap-2 sm:grid-cols-2">
          {f.regalos.map((r, i) => (
            <li key={r} className="flex items-start gap-2 bg-white/70 px-3 py-2">
              <span className="font-pixel text-[var(--cta)]">{i + 1}.</span> {r}
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion icono="friend" titulo="Así se ve">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {f.datos.map((d) => (
            <div key={d.label} className="flex justify-between gap-2 border-b border-[var(--ink)]/15 py-1">
              <dt className="text-[var(--ink-soft)]">{d.label}</dt>
              <dd className="font-semibold">{d.valor}</dd>
            </div>
          ))}
        </dl>
      </Seccion>

      <Seccion icono="heart" titulo="Amor y relaciones">
        <Respuestas items={f.amor} />
      </Seccion>

      <Seccion icono="chili" titulo="Picante">
        <Respuestas items={f.picante} />
      </Seccion>

      <footer className="mt-6 border-t-[3px] border-dashed border-[var(--ink)]/30 pt-4 text-center text-[0.9rem] italic text-[var(--ink-soft)]">
        Privada y confidencial. Guárdala para describir y reír el día del intercambio.
      </footer>
    </article>
  );
}

function Seccion({ icono, titulo, children }: { icono: "chest" | "friend" | "heart" | "chili"; titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 flex items-center gap-2 font-pixel text-[1.05rem]">
        <PixelIcon name={icono} size={18} /> {titulo}
      </h2>
      {children}
    </section>
  );
}

function Respuestas({ items }: { items: { pregunta: string; respuesta: string | null }[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li key={it.pregunta} className="flex items-baseline justify-between gap-3 bg-white/70 px-3 py-2">
          <span className="text-[0.92rem]">{it.pregunta}</span>
          {it.respuesta === null ? (
            <span className="px-chip shrink-0 !text-[0.75rem]" style={{ ["--chip" as string]: "#e6dfd1", color: "var(--ink-soft)" }}>Pasó</span>
          ) : (
            <span className="shrink-0 font-pixel text-[var(--cta)]">{it.respuesta}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
