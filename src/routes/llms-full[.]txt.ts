import { createFileRoute } from "@tanstack/react-router";

import getLLMText from "@/lib/llm";
import source from "@/lib/source";

/**
 * Full docs dump for LLM consumption.
 * Returns all documentation pages as a single markdown file.
 */
export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const pages = source.getPages();
        const texts = await Promise.all(pages.map(getLLMText));

        return new Response(texts.join("\n\n---\n\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      },
    },
  },
});
