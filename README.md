# dew

My go-to full-stack end-to-end type-safe React project template.

```bash
# Install dependencies
bun install

# Run dev server
bun dev

# Build production bundle
bun build

# Run production bundle
bun start
```

## Libraries

- Bun
- Vinxi
- React 19
- TanStack Router
- TanStack Query v5
- TailwindCSS v4
- ElysiaJS

## Stack

- `backend` contains the backend API code.
- `web` contains the frontend SPA code.
- `stack` contains shared code between the backend and frontend.

## Guidelines

1. Define your shared entities, business logic, and global variables in `stack`.
2. Define your server-side controllers, workers, API routes, secrets, and global variables in `backend`.
3. Define your client-side components, routes, hooks, styles and global variables in `web`.

## Design Decisions

### ElysiaJS instead of TanStack Start

TanStack Start is intentionally NOT used because:

1. the API surface around server functions and API routes is still a heavy work in progress,
2. there is no way to work around current limitations with server functions/API routes because its internals (i.e. configuring how requests/responses get transformed when invoking a server function) are not exposed.

ElysiaJS is integrated as an alternative to TanStack Start. ElysiaJS provides end-to-end type safety for both the frontend and backend.

ElysiaJS has been a pleasure to work with. ElysiaJS comes out of the box with support for:

- dependency injection via. "plugins"
- end-to-end type safety with thousands of routes and plugins
- lots of useful official/community-backed plugins (OpenAPI, GraphQL, JWT, Streaming, Server Timing, OpenTelemetry, etc.)

An isomorphic type-safe API client (a client that may be invoked on the client/server) for interacting with the built-in ElysiaJS server is available in the `stack` library. The client is built using ElysiaJS' Eden Treaty and `vite-env-only`.

### No SSR

I intentionally set up the project to not support SSR.

For the purposes of projects I work on, they generally feature _a lot_ of highly dynamic data (data that is likely to change very frequently). It is generally pointless to server-side render pages whose contents frequently changes because the HTML provided by the server is likely to be stale/outdated in terms of contents by the time it is fully delivered to the client.

Disabling SSR also gives peace of mind to frontend developers in your team. They are free to use any client-side libraries, export global variables, and more without needing to worry about what code gets run in the SSR boundary and what code does not. This saves A LOT of headaches when working with a team of developers.