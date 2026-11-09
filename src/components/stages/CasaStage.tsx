import { PixelIcon } from "@/components/ui/PixelIcon";
import { faltanHoy, type Stage } from "./datosEjemplo";

/** Color del techo según el papel del stage (el mismo que usaba el regalo envuelto). */
const TECHO: Record<Stage["papel"], [string, string]> = {
  rojo: ["#c8102e", "#8e0b21"],
  verde: ["#1f7a4d", "#11532f"],
  azul: ["#2c4aa8", "#1b2f73"],
  morado: ["#6b3fa0", "#472870"],
};

/**
 * Casa de Snowville que representa un stage. Dibujada en SVG (bordes nítidos, estilo pixel)
 * y escalada con la unidad --c de la aldea, así nunca se deforma al alejar o acercar la página.
 *  - nuevas: ventanas encendidas, humo en la chimenea, corona en la puerta y un globo con
 *    cuántas preguntas nuevas te faltan hoy.
 *  - aldia: encendida y con bandera dorada en el techo (ya respondiste todo lo de hoy).
 *  - cerrada (solo la ficha): luces apagadas, nieve en la puerta y candado.
 * El stage 6 (amigo secreto) lleva cinta de regalo en el techo.
 */
export function CasaStage({ s }: { s: Stage }) {
  const [techo, techoHondo] = TECHO[s.papel];
  const luz = s.estado !== "cerrada";
  const nuevas = s.estado === "nuevas";
  const regalo = s.n === 6;
  const ventana = luz ? "#ffd76a" : "#27336a";

  return (
    <span className="casa-dibujo" data-estado={s.estado} aria-hidden>
      <svg viewBox="0 0 100 110" shapeRendering="crispEdges">
        {/* Charco de luz cálida sobre la nieve */}
        {luz && <ellipse cx="50" cy="104" rx="30" ry="6" fill="#ffd76a" opacity="0.35" className="casa-charco" />}
        <ellipse cx="50" cy="104" rx="47" ry="6" fill="#eef3ff" shapeRendering="auto" />

        {/* Chimenea y humo */}
        <rect x="66" y="22" width="10" height="22" fill="#9a4b3c" />
        <rect x="64" y="20" width="14" height="5" fill="#fff" />
        {nuevas && (
          <g className="casa-humo" fill="#e6ecff" shapeRendering="auto">
            <circle cx="71" cy="14" r="3.5" />
            <circle cx="74" cy="8" r="4.5" />
            <circle cx="70" cy="2" r="5" />
          </g>
        )}

        {/* Paredes de madera con tablas */}
        <rect x="14" y="52" width="72" height="50" fill={luz ? "#f3dfb8" : "#c9bfae"} />
        {[62, 72, 82, 92].map((y) => (
          <rect key={y} x="14" y={y} width="72" height="1.5" fill="#000" opacity="0.08" />
        ))}

        {/* Techo con nieve */}
        <polygon points="4,57 50,15 96,57" fill={techo} />
        <polygon points="4,57 50,15 96,57 96,61 4,61" fill={techoHondo} />
        <polygon points="4,57 50,15 96,57 89,57 50,23 11,57" fill="#fff" />
        <rect x="16" y="56" width="5" height="5" fill="#fff" />
        <rect x="43" y="57" width="4" height="7" fill="#fff" />
        <rect x="76" y="56" width="5" height="4" fill="#fff" />
        {regalo && (
          <>
            <polygon points="46,19 54,19 54,59 46,59" fill="var(--oro)" />
            <rect x="46" y="57" width="8" height="45" fill="var(--oro)" opacity="0.9" />
          </>
        )}

        {/* Placa redonda con el ícono del stage (el ícono va encima, en HTML) */}
        <circle cx="50" cy="42" r="11" fill="var(--papel)" stroke={techoHondo} strokeWidth="2.5" shapeRendering="auto" />

        {/* Ventanas */}
        {[20, 66].map((x) => (
          <g key={x}>
            <rect x={x} y="66" width="14" height="13" fill={ventana} className={luz ? "casa-ventana" : undefined} />
            <rect x={x + 6.25} y="66" width="1.5" height="13" fill="#7a4a2a" />
            <rect x={x} y="71.75" width="14" height="1.5" fill="#7a4a2a" />
            <rect x={x - 1} y="78" width="16" height="3" fill="#fff" />
          </g>
        ))}

        {/* Puerta */}
        <rect x="40" y="72" width="20" height="30" fill={luz ? "#7a4a2a" : "#4a3328"} />
        <rect x="43" y="75" width="14" height="27" fill={luz ? "#9a5b34" : "#5a3d2e"} />
        <rect x="53" y="88" width="2.5" height="2.5" fill="var(--oro)" />
        {nuevas && <circle cx="50" cy="82" r="4.5" fill="none" stroke="#2f9e5f" strokeWidth="2.5" shapeRendering="auto" />}
        {nuevas && <rect x="48.5" y="85" width="3" height="3" fill="#e8283c" />}
        {!luz && <ellipse cx="50" cy="101" rx="13" ry="4.5" fill="#fff" shapeRendering="auto" />}

        {/* Bandera de "al día" */}
        {s.estado === "aldia" && !regalo && (
          <g>
            <rect x="49" y="2" width="2" height="15" fill="#5b5470" />
            <polygon points="51,3 63,6.5 51,10" fill="var(--oro)" />
          </g>
        )}
      </svg>

      <span className="casa-placa">
        <PixelIcon name={s.icono} size={24} />
      </span>
      {regalo && (
        <span className="casa-lazo">
          <PixelIcon name="bowOro" size={36} />
        </span>
      )}
      {s.estado === "cerrada" && (
        <span className="casa-candado">
          <PixelIcon name="lock" size={18} />
        </span>
      )}
      {nuevas && <span className="casa-aviso f-titulo">{faltanHoy(s)}</span>}
    </span>
  );
}
