import { sessionRouter } from "./apis/session/session-router";
import { zoomRouter } from "./apis/zoom/zoom-router";

export const appRouter = {
  session: sessionRouter,
  zoom: zoomRouter,
};

export type AppRouter = typeof appRouter;
