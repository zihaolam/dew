import { outdent } from "outdent";
import { eventHandler } from "vinxi/http";

const index = outdent`
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>dew</title>
    <link rel="icon" href="/favicon.ico" />
    </head>
    <body>
    <div id="app" class="contents"></div>
    <script src="./web/app/client.tsx" type="module"></script>
    </body>
    </html>
`;

export default eventHandler(
  () =>
    new Response(index, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    })
);
