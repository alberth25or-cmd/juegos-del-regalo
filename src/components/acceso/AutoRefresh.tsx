"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Vuelve a pedir los datos del servidor cada N segundos mientras la pestaña está visible. */
export function AutoRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => window.clearInterval(id);
  }, [router, seconds]);
  return null;
}
