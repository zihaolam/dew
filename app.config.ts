import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { createApp } from "vinxi";
import { envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";
import { config } from "vinxi/plugins/config";

import * as vite from "vite";
import type { Manifest } from "@tanstack/react-router";
import path from "node:path";
import fs from "node:fs";

const TANSTACK_ROUTES_DIRECTORY = "./web/routes";
const TANSTACK_GENERATED_ROUTE_TREE = "./web/app/routeTree.gen.ts";

const CLIENT_BASE_PATH = "/_build";
const CLIENT_HANDLER_PATH = "./web/app/client.tsx";

const SSR_BASE_PATH = "/";
const SSR_HANDLER_PATH = "./web/app/ssr.tsx";

const BACKEND_BASE_PATH = "/api";
const BACKEND_HANDLER_PATH = "./backend/handler.ts";

export default createApp({
  server: {
    experimental: { asyncContext: true },
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
      name: "client",
      type: "client",
      base: CLIENT_BASE_PATH,
      handler: CLIENT_HANDLER_PATH,
      plugins: () => [
        envOnlyMacros(),
        tsconfigPaths(),

        config("client", {
          ssr: { noExternal: ["@tanstack/start", "tsr:routes-manifest"] },
          build: { sourcemap: true },
        }),

        TanStackRouterVite({
          autoCodeSplitting: true,
          routesDirectory: TANSTACK_ROUTES_DIRECTORY,
          generatedRouteTree: TANSTACK_GENERATED_ROUTE_TREE,
          disableLogging: true,
        }),
        // NOTE(kenta): Vinxi has issues with TailwindCSS v4's Vite plugin.
        // tailwindcss(),
        react(),
      ],
    },
    {
      name: "ssr",
      type: "http",
      base: SSR_BASE_PATH,
      handler: SSR_HANDLER_PATH,
      plugins: () => [
        envOnlyMacros(),
        tsconfigPaths(),

        config("ssr", {
          ssr: { noExternal: ["@tanstack/start", "tsr:routes-manifest"] },
        }),

        TanStackRoutesManifest(),
      ],
      // @ts-expect-error - this is a valid config in Vinxi
      link: { client: "client" },
    },
    {
      name: "api",
      type: "http",
      target: "server",
      base: BACKEND_BASE_PATH,
      handler: BACKEND_HANDLER_PATH,
      plugins: () => [
        config("ssr", {
          ssr: { noExternal: ["@tanstack/start", "tsr:routes-manifest"] },
        }),
        envOnlyMacros(),
        tsconfigPaths(),
      ],
    },
  ],
});

function TanStackRoutesManifest(): vite.Plugin {
  let config: vite.ResolvedConfig;

  return {
    name: "tsr-routes-manifest",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    resolveId(id) {
      if (id === "tsr:routes-manifest") {
        return id;
      }
      return;
    },
    async load(id) {
      if (id === "tsr:routes-manifest") {
        // If we're in development, return a dummy manifest

        if (config.command === "serve") {
          return `export default () => ({
            routes: {}
          })`;
        }

        const clientViteManifestPath = path.resolve(
          config.build.outDir,
          `../client/${CLIENT_BASE_PATH}/.vite/manifest.json`
        );

        type ViteManifest = Record<
          string,
          {
            file: string;
            isEntry: boolean;
            imports: Array<string>;
          }
        >;

        let manifest: ViteManifest;
        try {
          manifest = JSON.parse(
            fs.readFileSync(clientViteManifestPath, "utf-8")
          );
        } catch (err) {
          console.error(err);
          throw new Error(
            `Could not find the production client vite manifest at '${clientViteManifestPath}'!`
          );
        }

        const routeTreePath = path.resolve(TANSTACK_GENERATED_ROUTE_TREE);

        let routeTreeContent: string;
        try {
          routeTreeContent = fs.readFileSync(routeTreePath, "utf-8");
        } catch (err) {
          console.error(err);
          throw new Error(
            `Could not find the generated route tree at '${routeTreePath}'!`
          );
        }

        // Extract the routesManifest JSON from the route tree file.
        // It's located between the /* ROUTE_MANIFEST_START and ROUTE_MANIFEST_END */ comment block.

        const routerManifest = JSON.parse(
          routeTreeContent.match(
            /\/\* ROUTE_MANIFEST_START([\s\S]*?)ROUTE_MANIFEST_END \*\//
          )?.[1] || "{ routes: {} }"
        ) as Manifest;

        const routes = routerManifest.routes;

        let entryFile:
          | {
              file: string;
              imports: Array<string>;
            }
          | undefined;

        const filesByRouteFilePath: ViteManifest = Object.fromEntries(
          Object.entries(manifest).map(([k, v]) => {
            if (v.isEntry) {
              entryFile = v;
            }

            const rPath = k.split("?")[0];

            return [rPath, v];
          }, {})
        );

        // Add preloads to the routes from the vite manifest
        Object.entries(routes).forEach(([k, v]) => {
          const file =
            filesByRouteFilePath[
              path.join(TANSTACK_ROUTES_DIRECTORY, v.filePath as string)
            ];

          if (file) {
            const preloads = file.imports.map((d) =>
              path.join(CLIENT_BASE_PATH, manifest[d]!.file)
            );

            preloads.unshift(path.join(CLIENT_BASE_PATH, file.file));

            routes[k] = {
              ...v,
              preloads,
            };
          }
        });

        if (entryFile) {
          routes.__root__!.preloads = [
            path.join(CLIENT_BASE_PATH, entryFile.file),
            ...(entryFile.imports?.map((d) =>
              path.join(CLIENT_BASE_PATH, manifest[d]!.file)
            ) ?? []),
          ];
        }

        const recurseRoute = (
          route: {
            preloads?: Array<string>;
            children?: Array<any>;
          },
          seenPreloads = {} as Record<string, true>
        ) => {
          route.preloads = route.preloads?.filter((preload) => {
            if (seenPreloads[preload]) {
              return false;
            }
            seenPreloads[preload] = true;
            return true;
          });

          if (route.children) {
            route.children.forEach((child) => {
              const childRoute = routes[child]!;
              recurseRoute(childRoute, { ...seenPreloads });
            });
          }
        };

        recurseRoute(routes.__root__);

        const routesManifest = {
          routes,
        };

        if (process.env.TSR_VITE_DEBUG) {
          console.info(JSON.stringify(routesManifest, null, 2));
        }

        return `export default () => (${JSON.stringify(routesManifest)})`;
      }
      return;
    },
  };
}
