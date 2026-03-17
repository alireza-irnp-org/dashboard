const openAPISchemaURL = "/api/v1/openapi.json";

export function GET() {
  const html = `<!doctype html>
<html>
  <head>
    <title>Dashboard API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url=${openAPISchemaURL}
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
