import stylesUrl from "#/styles/app.css?url";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import { outdent } from "outdent";

const createRootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>();

export const Route = createRootRoute({
  component: RootComponent,
  head: () => {
    const scripts: React.JSX.IntrinsicElements["script"][] = [];

    if (import.meta.env.DEV === true) {
      scripts.push({
        type: "module",
        children: outdent`
          import RefreshRuntime from "/_build/@react-refresh"
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
        `,
      });
    }

    return {
      scripts,
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
      ],
      links: [{ rel: "stylesheet", href: stylesUrl }],
    };
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body>
        {children}
        <ReactQueryDevtools />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
