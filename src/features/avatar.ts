/**
 * Avatar pixel personalizable. Las opciones viven aquí para que el editor (navegador)
 * y la validación (servidor) usen exactamente la misma lista.
 */

export const OPCIONES_AVATAR = {
  piel: ["#f6d3b3", "#e8b48a", "#c98d62", "#a8714a", "#7a4d2e", "#5a3720"],
  abrigo: ["#c0392b", "#2e9e78", "#2f6fb0", "#7b4bb7", "#d4a017", "#e06c9f", "#3b3f5c", "#e67e22"],
  gorro: ["santa", "duende", "reno", "lana", "corona", "auditor", "ninguno"],
  colorGorro: ["#c0392b", "#2e9e78", "#2f6fb0", "#f6b93b", "#fff6e5", "#7b4bb7", "#3b3f5c"],
  bufanda: ["#f6b93b", "#fff6e5", "#c0392b", "#2e9e78", "#57b9f0", "#ff8fb0"],
  pelo: ["#2a1d17", "#5b3a29", "#a0522d", "#d9a441", "#e8e0d0", "#c0392b"],
  accesorio: ["ninguno", "lentes", "bigote", "audifonos", "mejillas"],
} as const;

export type CampoAvatar = keyof typeof OPCIONES_AVATAR;
export type ConfigAvatar = { [K in CampoAvatar]: (typeof OPCIONES_AVATAR)[K][number] };

export const NOMBRES_GORRO: Record<string, string> = {
  santa: "Gorro de Santa",
  duende: "Gorro de duende",
  reno: "Cuernos de reno",
  lana: "Gorro de lana",
  corona: "Corona de cartón",
  auditor: "Sombrero de auditor",
  ninguno: "Sin gorro",
};

export const NOMBRES_ACCESORIO: Record<string, string> = {
  ninguno: "Nada",
  lentes: "Lentes",
  bigote: "Bigote sospechoso",
  audifonos: "Audífonos",
  mejillas: "Mejillas de frío",
};

export const AVATAR_POR_DEFECTO: ConfigAvatar = {
  piel: "#e8b48a",
  abrigo: "#c0392b",
  gorro: "santa",
  colorGorro: "#c0392b",
  bufanda: "#f6b93b",
  pelo: "#2a1d17",
  accesorio: "ninguno",
};

/** Normaliza lo que llegue (del navegador o de la BD) a un avatar válido. */
export function avatarValido(entrada: unknown): ConfigAvatar {
  const src = entrada && typeof entrada === "object" ? (entrada as Record<string, unknown>) : {};
  const out = { ...AVATAR_POR_DEFECTO } as Record<CampoAvatar, string>;
  for (const campo of Object.keys(OPCIONES_AVATAR) as CampoAvatar[]) {
    const v = src[campo];
    if (typeof v === "string" && (OPCIONES_AVATAR[campo] as readonly string[]).includes(v)) out[campo] = v;
  }
  return out as ConfigAvatar;
}

/** Avatar aleatorio (para el botón "sorpréndeme"). */
export function avatarAlAzar(azar: () => number = Math.random): ConfigAvatar {
  const out = {} as Record<CampoAvatar, string>;
  for (const campo of Object.keys(OPCIONES_AVATAR) as CampoAvatar[]) {
    const lista = OPCIONES_AVATAR[campo];
    out[campo] = lista[Math.floor(azar() * lista.length)];
  }
  return out as ConfigAvatar;
}

/**
 * Cabeza del AGENTE en el juego de las casas: sale del alias, no del personaje de Snowville.
 * Si usáramos el avatar que cada uno armó (y que se ve con su nombre en el mundo), cualquiera
 * reconocería quién es cada agente. Misma entrada → misma cabeza en todos lados.
 */
export function avatarDeAlias(alias: string): ConfigAvatar {
  let h = 0x811c9dc5;
  for (let i = 0; i < alias.length; i++) {
    h ^= alias.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let a = h >>> 0;
  return avatarAlAzar(() => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  });
}
