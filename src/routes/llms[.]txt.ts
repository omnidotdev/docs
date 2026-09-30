import { createFileRoute } from "@tanstack/react-router";

import app from "@/lib/config/app.config";
import source from "@/lib/source";

/**
 * llms.txt index for LLM/agent consumption.
 *
 * Follows the https://llmstxt.org convention: a curated map of the docs linking
 * to each page, so an agent can discover what exists and fetch just what it
 * needs. The full concatenated content lives at /llms-full.txt, and any single
 * page is available as clean markdown at /llms.mdx/docs/<slug>.
 */

// Human-facing heading per top-level section, in the order they should appear.
// Unlisted sections fall back to a title-cased segment and sort to the end.
const SECTION_HEADINGS: Record<string, string> = {
  "": "Overview",
  learn: "Learn",
  products: "Products",
  realms: "Realms",
  community: "Community",
  help: "Help",
};

const SECTION_ORDER = Object.keys(SECTION_HEADINGS);

const getSegment = (url: string): string =>
  url.split("/").filter(Boolean)[0] ?? "";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () => {
        const base = app.appUrl.replace(/\/+$/, "");

        // group pages by their top-level path segment, skipping mirrored
        // product docs that are canonical elsewhere (matches the sitemap)
        const groups = new Map<
          string,
          { title: string; description?: string; url: string }[]
        >();

        for (const page of source.getPages()) {
          if (page.data.canonical) continue;

          const segment = getSegment(page.url);
          const entry = {
            title: page.data.title,
            description: page.data.description,
            url: `${base}${page.url}`,
          };

          const existing = groups.get(segment);

          if (existing) existing.push(entry);
          else groups.set(segment, [entry]);
        }

        const orderOf = (segment: string): number => {
          const index = SECTION_ORDER.indexOf(segment);

          return index === -1 ? SECTION_ORDER.length : index;
        };

        const titleCase = (segment: string): string =>
          segment
            ? segment.charAt(0).toUpperCase() + segment.slice(1)
            : "Overview";

        const sections = [...groups.entries()]
          .sort(([a], [b]) => orderOf(a) - orderOf(b) || a.localeCompare(b))
          .map(([segment, entries]) => {
            const heading = SECTION_HEADINGS[segment] ?? titleCase(segment);

            const lines = entries
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((entry) =>
                entry.description
                  ? `- [${entry.title}](${entry.url}): ${entry.description}`
                  : `- [${entry.title}](${entry.url})`,
              )
              .join("\n");

            return `## ${heading}\n\n${lines}`;
          })
          .join("\n\n");

        const body = `# Omni Documentation

> Documentation for the Omni ecosystem: open-source apps, services, and platforms, plus plain-English guides to the web concepts behind running an online presence.

The full text of every page is available at ${base}/llms-full.txt, and any single page as clean markdown at ${base}/llms.mdx/docs/<path>.

${sections}
`;

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      },
    },
  },
});
