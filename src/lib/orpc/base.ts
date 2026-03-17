import { ORPCError, os } from "@orpc/server";
import { getZoomClient, type ZoomClient } from "@/lib/sdks/zoom/zoom-client";
import type { Context, Session } from "./context";

export const pub = os.$context<Context>();

export const authed = pub.use(({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: { ...context, session: context.session as Session },
  });
});

export const zoomAuthed = authed.use(async ({ context, next }) => {
  const zoom = await getZoomClient(context.headers);
  if (!zoom) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Zoom account not connected",
    });
  }
  return next({ context: { ...context, zoom: zoom as ZoomClient } });
});
