import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import ErrorComponent from "@/components/ErrorComponent";
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
    defaultErrorComponent: ErrorComponent,
  });
