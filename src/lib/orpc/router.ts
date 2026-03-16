import { zoomRouter } from "./zoom/zoom-router";

export const appRouter = {
  zoom: zoomRouter,
};

export type AppRouter = typeof appRouter;
