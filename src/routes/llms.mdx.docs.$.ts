import { createFileRoute, notFound } from "@tanstack/react-router";

import getLLMText from "@/lib/llm";
import source from "@/lib/source";

/**
 * Raw markdown route handler for LLM consumption.
 * Serves page content as plain markdown when accessed via /llms.mdx/docs/[...slug].
 */
export const Route = createFileRoute("/llms.mdx/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = params._splat?.split("/") ?? [];
        const page = source.getPage(slugs);

        if (!page) throw notFound();

        const content = await getLLMText(page);

        return new Response(content, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
          },
        });
      },
    },
  },
});
