/// <reference types="vinxi/types/client" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "#/styles/app.css";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

const router = createRouter({
  routeTree,
  defaultStaleTime: 0,
  context: {
    queryClient,
  },
  Wrap({ children }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  },
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

const root = ReactDOM.createRoot(rootElement);
root.render(<RouterProvider router={router} />);
