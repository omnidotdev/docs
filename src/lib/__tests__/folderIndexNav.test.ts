/**
 * Guards the folder-index navigation convention.
 *
 * Fumadocs auto-detects a folder's `index.mdx` and, by default, links the
 * folder's sidebar entry directly to it. But if `meta.json` also lists "index"
 * in its `pages` array, the builder demotes the index to an ordinary child and
 * drops the folder link, so the sidebar renders the folder name once as a
 * (non-linking) collapsible trigger and again as its first child. For products
 * whose folder title equals the index title (e.g. "🔷 Fractal"), that reads as
 * "Fractal > Fractal", and the top-level product name is no longer clickable.
 *
 * The fix and the convention: never list "index" in a non-root folder's pages;
 * let the folder link to its index. This test fails if any folder regresses.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const DOCS_DIR = resolve(process.cwd(), "content/docs");

/** Recursively collect every directory that contains a `meta.json`. */
const findMetaDirs = (dir: string): string[] => {
  const dirs: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (!statSync(full).isDirectory()) continue;

    if (
      readdirSync(full).some((f) => f === "meta.json") &&
      // a folder is a "meta dir" only if it also holds an index page; the root
      // welcome meta has no index.mdx and legitimately lists "index"
      readdirSync(full).some((f) => f === "index.mdx" || f === "index.md")
    ) {
      dirs.push(full);
    }

    dirs.push(...findMetaDirs(full));
  }

  return dirs;
};

describe("folder-index navigation convention", () => {
  const metaDirs = findMetaDirs(DOCS_DIR);

  it("finds folders to check", () => {
    expect(metaDirs.length).toBeGreaterThan(0);
  });

  it.each(metaDirs.map((dir) => [relative(DOCS_DIR, dir), dir] as const))(
    "%s does not list 'index' in its pages",
    (_label, dir) => {
      const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8")) as {
        root?: boolean;
        pages?: string[];
      };

      // a `root` folder is not rendered as a linkable sidebar folder, so it may
      // list its own index page
      if (meta.root) return;

      expect(
        meta.pages?.includes("index"),
        `${relative(DOCS_DIR, dir)}/meta.json lists "index" in pages; a folder ` +
          `with an index page must omit it so the folder links to its index ` +
          `(otherwise the sidebar shows the name twice, nested)`,
      ).not.toBe(true);
    },
  );
});
