import type { auth } from "@/lib/auth/auth";

export type Session = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export type Context = {
  session: Session | null;
  headers: Headers;
};
