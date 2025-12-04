import { createFileRoute } from "@tanstack/react-router";
import { createFromSource as createSearchServerFromSource } from "fumadocs-core/search/server";

import source from "@/lib/source";

/**
 * Search server.
 * @see https://fumadocs.dev/docs/headless/search
 */
const searchServer = createSearchServerFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: "english",
});

/**
 * Search API route.
 */
export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => searchServer.GET(request),
    },
  },
});
