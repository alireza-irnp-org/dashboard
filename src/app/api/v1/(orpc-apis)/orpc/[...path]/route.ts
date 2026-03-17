import { auth } from "@/lib/auth/auth";
import { appRouter } from "@/lib/orpc/router";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from '@orpc/server'
import { CORSPlugin } from '@orpc/server/plugins'


const handler = new RPCHandler(appRouter, {
  plugins: [
    new CORSPlugin()
  ],
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
});

async function handleRequest(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  const { matched, response } = await handler.handle(req, {
    prefix: "/api/v1/orpc",
    context: { session, headers: req.headers },
  });

  if (matched) return response;
  return new Response("Not found", { status: 404 });
}

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as PUT,
  handleRequest as PATCH,
  handleRequest as DELETE,
};
