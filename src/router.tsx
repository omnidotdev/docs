import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import NotFound from "@/components/not-found";

/**
 * Get page router.
 */
export const getRouter = () =>
  createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  });
