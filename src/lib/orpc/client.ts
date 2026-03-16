import { createORPCClient } from "@orpc/client";
import type { RouterClient } from '@orpc/server'
import { RPCLink } from "@orpc/client/fetch";
import { createRouterUtils } from "@orpc/tanstack-query";
import type { AppRouter } from "./router";

const link = new RPCLink({
  url: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL}/api/orpc`,
  // url: `${typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL ?? "")}/api/orpc`,
  // url: () => {
  //   if (typeof window === "undefined") {
  //     throw new Error("RPCLink is not allowed on the server side.");
  //   }
  //   return `${window.location.origin}/api/orpc`;
  // },
  headers: async () => {
    if (typeof window !== 'undefined') {
      return {}
    }

    const { headers } = await import('next/headers')
    return await headers()
  },
});

export const orpc: RouterClient<AppRouter> = createORPCClient(link)

export const orpcUtils = createRouterUtils(orpc);
