import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

const createRootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>();

export const Route = createRootRoute({
  component: RootComponent,
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
    <>
      {children}
      <ReactQueryDevtools />
      <ScrollRestoration />
    </>
  );
}
