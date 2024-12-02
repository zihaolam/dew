/// <reference types="vinxi/types/server" />

import { getRouterManifest } from "@tanstack/start/router-manifest";
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/start/server";
import { createTanstackRouter } from "./router";

export default createStartHandler({
  createRouter: createTanstackRouter,
  getRouterManifest,
})(defaultStreamHandler);
