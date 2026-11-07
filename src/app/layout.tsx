import type { Metadata, Viewport } from "next";
import { DM_Sans, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { AtmosphereBootScript, AtmosphereProvider } from "@/components/atmosphere/AtmosphereProvider";
import { Suspense } from "react";
import { BottomNav, BottomNavStatic } from "@/components/nav/BottomNav";
import { TimeMachine } from "@/components/atmosphere/TimeMachine";
import { ModoLigero, SCRIPT_LIGERO } from "@/components/rendimiento/ModoLigero";
import { MusicaGlobal } from "@/components/musica/MusicaGlobal";

const pixelify = Pixelify_Sans({ variable: "--font-pixelify", subsets: ["latin", "latin-ext"], weight: ["400", "600", "700"] });
const dm = DM_Sans({ variable: "--font-dm", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_TAGLINE,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b1f4a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PE" className={`${pixelify.variable} ${dm.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <AtmosphereBootScript />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_LIGERO }} />
      </head>
      <body className="min-h-full">
        <AtmosphereProvider>
          <ModoLigero />
          {children}
          <TimeMachine />
          <Suspense fallback={<BottomNavStatic />}>
            <BottomNav />
          </Suspense>
          <Suspense fallback={null}>
            <MusicaGlobal />
          </Suspense>
        </AtmosphereProvider>
      </body>
    </html>
  );
}
