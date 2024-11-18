import { treaty } from "@elysiajs/eden";
import { app } from "backend";
import { getWebRequest } from "vinxi/http";
import { clientOnly$, serverOnly$ } from "vite-env-only/macros";

export const SESSION_DURATION_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

const ssrClient = serverOnly$(
  treaty(app, {
    headers: [
      () => {
        const request = getWebRequest();
        return request.headers;
      },
    ],
  })
);

const webClient = clientOnly$(treaty<typeof app>(window.location.origin));

export const { api } = (ssrClient ?? webClient)!;
