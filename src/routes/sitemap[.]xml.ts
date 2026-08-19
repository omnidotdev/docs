import { createFileRoute } from "@tanstack/react-router";

import app from "@/lib/config/app.config";
import source from "@/lib/source";

/**
 * XML sitemap of canonical documentation URLs.
 *
 * Emits one entry per served page from the content source, so only the
 * canonical `/products/*`, `/realms/*`, and ecosystem URLs are listed (legacy
 * URLs are handled by redirects, never surfaced here). Undeployed private
 * product pages are absent from a committed build, so they never appear.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const base = app.appUrl.replace(/\/+$/, "");

        const escapeXml = (value: string): string =>
          value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const locs = [...new Set(source.getPages().map((page) => page.url))]
          .sort()
          .map((url) => `  <url><loc>${escapeXml(`${base}${url}`)}</loc></url>`)
          .join("\n");

        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs}\n</urlset>\n`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        });
      },
    },
  },
});
