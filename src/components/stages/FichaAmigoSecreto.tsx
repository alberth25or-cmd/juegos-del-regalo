import { PixelIcon, type IconName } from "@/components/ui/PixelIcon";
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
    <article className="clay relative mx-auto max-w-2xl overflow-hidden">
      {/* Cabecera tipo sobre: papel rojo con lunares y sello */}
      <header className="relative flex flex-col items-center px-6 pb-8 pt-9 text-center text-white" style={{ background: "radial-gradient(circle, rgb(255 255 255 / 0.18) 5px, transparent 6px) 0 0 / 30px 30px, radial-gradient(circle, rgb(255 255 255 / 0.18) 5px, transparent 6px) 15px 15px / 30px 30px, #c8102e" }}>
        <span className="absolute right-4 top-4 rotate-6 rounded-full border-[3px] border-white/85 px-3 py-1 text-[0.72rem] font-black uppercase tracking-wider">Privada y confidencial</span>
        <Cabeza config={f.avatar} size={46} bola />
        <p className="mt-3 text-[0.95rem] font-bold text-white/90">Tu amigo secreto es</p>
        <h1 className="f-titulo text-[2.3rem] font-semibold leading-tight">{f.alias}</h1>
        <p className="mt-1 rounded-full bg-black/20 px-3 py-1 text-[0.9rem] font-semibold">El 24 dic dirás: &quot;mi regalo es para {f.alias}&quot;</p>
      </header>

      <div className="grid gap-6 p-6 sm:p-8">
        <Seccion icono="chest" titulo="Quiere uno de estos">
          <ol className="grid gap-2.5 sm:grid-cols-2">
            {f.regalos.map((r, i) => (
              <li key={r} className="flex items-center gap-3 rounded-[16px] bg-white px-3.5 py-3 font-bold shadow-[0_0_0_2px_#eee6f3]">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--rojo-boton)] text-[0.85rem] font-black text-white">{i + 1}</span>
                {r}
              </li>
            ))}
          </ol>
        </Seccion>

        <Seccion icono="friend" titulo="Así lo reconoces">
          <dl className="flex flex-wrap gap-2">
            {f.datos.map((d) => (
              <div key={d.label} className="rounded-full bg-[#e8f6ee] px-3.5 py-1.5 text-[0.92rem]">
                <dt className="inline font-semibold text-[var(--tinta-suave)]">{d.label}: </dt>
                <dd className="inline font-extrabold text-[var(--verde)]">{d.valor}</dd>
              </div>
            ))}
          </dl>
        </Seccion>

        <div className="grid gap-6 sm:grid-cols-2">
          <Seccion icono="heart" titulo="Amor y relaciones">
            <Respuestas items={f.amor} />
          </Seccion>
          <Seccion icono="chili" titulo="Picante">
            <Respuestas items={f.picante} />
          </Seccion>
        </div>

        <p className="rounded-[16px] bg-[#fff1d6] px-4 py-3 text-center text-[0.95rem] font-semibold text-[var(--tinta)]">
          Privada y confidencial. Guárdala para describir y reír el día del intercambio.
        </p>
      </div>
    </article>
  );
}

function Seccion({ icono, titulo, children }: { icono: IconName; titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="f-titulo mb-2.5 flex items-center gap-2 text-[1.3rem] font-semibold">
        <PixelIcon name={icono} size={22} /> {titulo}
      </h2>
      {children}
    </section>
  );
}

function Respuestas({ items }: { items: { pregunta: string; respuesta: string | null }[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li key={it.pregunta} className="rounded-[16px] bg-white px-3.5 py-2.5 shadow-[0_0_0_2px_#eee6f3]">
          <p className="text-[0.9rem] text-[var(--tinta-suave)]">{it.pregunta}</p>
          {it.respuesta === null ? (
            <p className="mt-0.5 text-[0.95rem] font-extrabold italic text-[var(--tinta-suave)]">Pasó</p>
          ) : (
            <p className="f-titulo mt-0.5 text-[1.2rem] font-semibold text-[var(--rojo-boton)]">{it.respuesta}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
