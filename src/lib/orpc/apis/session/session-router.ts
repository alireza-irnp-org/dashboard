import { authed } from "@/lib/orpc/base";
import { SessionSchema, SessionWithUserSchema, UserSchema } from "./session-schemas";

export const sessionRouter = {
    me: authed
        .route({ method: "GET", path: "/session/me", summary: "Get the current authenticated user", tags: ["Session"] })
        .output(UserSchema)
        .handler(async ({ context }) => context.session.user),

    current: authed
        .route({ method: "GET", path: "/session/current", summary: "Get the current session with user", tags: ["Session"] })
        .output(SessionWithUserSchema)
        .handler(async ({ context }) => ({
            session: context.session.session,
            user: context.session.user,
        })),
};
