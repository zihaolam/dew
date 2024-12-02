/// <reference types="vinxi/types/client" />

import { StartClient } from "@tanstack/start";
import ReactDOM from "react-dom/client";
import { createTanstackRouter } from "./router";

const router = createTanstackRouter();

ReactDOM.hydrateRoot(document, <StartClient router={router} />);
