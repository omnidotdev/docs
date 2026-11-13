import { createFileRoute } from "@tanstack/react-router";

import app from "@/lib/config/app.config";
import source from "@/lib/source";

/**
 * Curated llms.txt index for LLM and agent discovery.
 *
 * The companion to `/llms-full.txt` (the full concatenated dump): a short,
 * grouped table of contents linking every served docs page, following the
 * llmstxt.org convention. Sections are derived from the content tree (one per
 * product/realm), so the index stays in sync with the docs without hand
 * maintenance. Points agents at `/llms-full.txt` and the per-page markdown
 * endpoint (`/llms.mdx/docs/<path>`).
 */
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () => {
        const base = app.appUrl.replace(/\/+$/, "");
        const pages = source.getPages();

        type Group = { key: string; title: string; pages: typeof pages };
        const groups = new Map<string, Group>();

        // Group by the first two path segments (e.g. `products/fractal`) so each
        // product or realm renders as one section
        const groupKeyOf = (url: string): string => {
          const segs = url.split("/").filter(Boolean);
          if (segs.length >= 2) return `${segs[0]}/${segs[1]}`;
          return segs[0] ?? "docs";
        };

        for (const page of pages) {
          const key = groupKeyOf(page.url);
          const group = groups.get(key) ?? { key, title: key, pages: [] };
          group.pages.push(page);
          groups.set(key, group);
        }

        // Prefer the group's index page title as the section heading
        for (const group of groups.values()) {
          const index = group.pages.find(
            (page) => page.url.replace(/\/+$/, "") === `/${group.key}`,
          );
          if (index?.data.title) group.title = index.data.title;
        }

        const sections = [...groups.values()]
          .sort((a, b) => a.key.localeCompare(b.key))
          .map((group) => {
            const items = [...group.pages]
              .sort((a, b) => a.url.localeCompare(b.url))
              .map((page) => {
                const desc = page.data.description
                  ? `: ${page.data.description}`
                  : "";
                return `- [${page.data.title}](${base}${page.url})${desc}`;
              })
              .join("\n");
            return `## ${group.title}\n\n${items}`;
          })
          .join("\n\n");

        const body = [
          `# ${app.name.long}`,
          "",
          `> ${app.description}`,
          "",
          `Curated index of Omni documentation for LLMs and agents. Each link points to a docs page. The full concatenated text is at ${base}/llms-full.txt. For any single page as raw markdown, request ${base}/llms.mdx/docs/<path> (for example ${base}/llms.mdx/docs/products/fractal/getting-started).`,
          "",
          sections,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
          },
        });
      },
    },
  },
});
