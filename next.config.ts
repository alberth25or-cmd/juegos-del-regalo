import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Enlaces de la versión anterior
  async redirects() {
    return [
      { source: "/unirse/:codigo", destination: "/i/:codigo", permanent: false },
      { source: "/panel", destination: "/admin", permanent: false },
      { source: "/prueba", destination: "/arcade", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
