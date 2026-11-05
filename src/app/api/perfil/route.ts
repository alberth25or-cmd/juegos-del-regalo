import { avatarValido } from "@/features/avatar";
import { cuerpo, ErrorDeUsuario, exigirJugador, manejador, ok, texto } from "@/lib/server/api";
import { conTope, db } from "@/lib/server/db";

/** El jugador solo cambia su perfil permitido: nombre visible, avatar y ajustes de humor. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador();
  const b = await cuerpo(req);
  const displayName = texto(b, "displayName", 40);
  if (displayName.length < 2 || displayName.length > 30) throw new ErrorDeUsuario("Tu nombre visible debe tener entre 2 y 30 letras.");
  const humor = texto(b, "humorLevel", 10);
  if (!["light", "friends", "chaos"].includes(humor)) throw new ErrorDeUsuario("Nivel de humor inválido.");
  const avatar = avatarValido(b.avatar);
  const sql = db();
  await conTope(sql`
    update cc.players set display_name = ${displayName}, avatar = ${sql.json(avatar)}, humor_level = ${humor},
           allow_roast = ${b.allowRoast === true}, allow_public_sharing = ${b.allowPublicSharing === true}
    where id = ${yo.id}
  `);
  return ok();
});
