import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import NotFound from "@/components/NotFound";
import { routeTree } from "./routeTree.gen";

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
