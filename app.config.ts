import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { createApp } from "vinxi";
import { envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

export default createApp({
  server: {
    compatibilityDate: "2024-11-19",
    preset: "bun",
  },
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
    {
      name: "web",
      type: "spa",
      base: "/",
      handler: "./web/app/handler.tsx",
      plugins: () => [
        envOnlyMacros(),
        tsconfigPaths(),
        TanStackRouterVite({
          routesDirectory: "./web/routes",
          generatedRouteTree: "./web/app/routeTree.gen.ts",
          // disableLogging: true,
        }),
        tailwindcss(),
        react(),
      ],
    },
    {
      name: "api",
      type: "http",
      target: "server",
      base: "/api",
      handler: "./backend/handler.ts",
      plugins: () => [envOnlyMacros(), tsconfigPaths()],
    },
  ],
});
