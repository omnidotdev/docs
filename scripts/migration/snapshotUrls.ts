/**
 * Snapshot every currently-live docs URL into a stable JSON manifest.
 *
 * The docs site is Fumadocs on TanStack Start with `baseUrl: "/"`: content
 * lives in `content/docs/**\/*.mdx` and a file's URL is its path relative to
 * `content/docs`, minus the `.mdx` extension. Fumadocs collapses `index.mdx`
 * onto its parent directory URL (`grid/vortex/index.mdx` -> `/grid/vortex`,
 * root `index.mdx` -> `/`).
 *
 * This walks the content tree, derives each URL, and writes a sorted (by url)
 * array of `{ url, file }` to `scripts/migration/data/legacy-urls.json`. That
 * snapshot is the source of truth for the 301 redirect map built in a later
 * phase, so it must capture EVERY live URL: a missing entry means a dead
 * inbound link once files move under `/products/<id>`. The output is stable
 * (deterministic walk + sort) so re-runs produce identical diffs, and the run
 * fails loudly if two files map to the same URL.
 */

import { readdirSync } from "node:fs";
import { relative, resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "../..");
const contentRoot = resolve(repoRoot, "content/docs");
const outPath = resolve(import.meta.dir, "data/legacy-urls.json");

/** Recursively collect absolute paths of every `.mdx` file under a directory. */
const walk = (dir: string): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(full);
    }
  }
  return files;
};

/**
 * Derive the live Fumadocs URL for an mdx file, given its path relative to
 * `content/docs` (POSIX-style, e.g. `grid/vortex/index.mdx`).
 */
const toUrl = (relPath: string): string => {
  const noExt = relPath.replace(/\.mdx$/, "");
  // Collapse `index` (the parent directory's own page) onto the directory URL
  const collapsed = noExt === "index" ? "" : noExt.replace(/\/index$/, "");
  return `/${collapsed}`;
};

const mdxFiles = walk(contentRoot);

const entries = mdxFiles.map((absPath) => {
  const relToContent = relative(contentRoot, absPath).split("\\").join("/");
  return {
    url: toUrl(relToContent),
    file: relative(repoRoot, absPath).split("\\").join("/"),
  };
});

// Detect collisions: two distinct files resolving to the same URL
const byUrl = new Map<string, string[]>();
for (const { url, file } of entries) {
  const bucket = byUrl.get(url) ?? [];
  bucket.push(file);
  byUrl.set(url, bucket);
}
const collisions = [...byUrl.entries()].filter(([, files]) => files.length > 1);

// Stable sort by url so re-runs produce identical output
const sorted = [...entries].sort((a, b) => a.url.localeCompare(b.url));

if (collisions.length > 0) {
  // biome-ignore lint/suspicious/noConsole: script output
  console.error(`[snapshot] FAIL: ${collisions.length} URL collision(s):`);
  for (const [url, files] of collisions) {
    // biome-ignore lint/suspicious/noConsole: script output
    console.error(`  ${url}\n    ${files.join("\n    ")}`);
  }
  process.exit(1);
}

await Bun.write(outPath, `${JSON.stringify(sorted, null, 2)}\n`);

// biome-ignore lint/suspicious/noConsole: script output
console.info(
  `[snapshot] ${mdxFiles.length} mdx files -> ${sorted.length} unique URLs, 0 collisions`,
);
// biome-ignore lint/suspicious/noConsole: script output
console.info(`[snapshot] wrote ${relative(repoRoot, outPath)}`);
