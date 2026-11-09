import { redirect } from "next/navigation";

/** La aldea de casas ahora es la pantalla principal ("/"). Este enlace viejo lleva ahí. */
export default function DisenoAntiguo() {
  redirect("/");
}
