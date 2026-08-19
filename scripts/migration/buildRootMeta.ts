/**
 * Regenerate the root docs meta.json, grouping the sidebar by realm.
 *
 * Reads the migration classification (classification.json), intersects with the
 * files tracked at git HEAD to keep only PUBLIC pages, and emits
 * content/docs/meta.json with:
 *
 *   - a Welcome section listing the ecosystem root pages still at content/docs/;
 *   - one section per realm (in realms.json order): the realm hub first, then
 *     the realm's public products, then its public realm guide pages;
 *   - the Community and Help ecosystem sections (folder-scoped globs).
 *
 * No global `...` catch-all is emitted, so unlisted (private) product pages
 * never leak into the committed nav. Regenerate with
 * `bun run scripts/migration/buildRootMeta.ts`.
 */

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import realmsData from "../../realms.json";

interface ClassificationEntry {
  /** Legacy URL. */
  url: string;
  /** Original, pre-move file path under content/docs/. */
  file: string;
  /** Classification kind. */
  kind: string;
  /** New URL, or null. */
  to: string | null;
}

const dataDir = resolve(import.meta.dir, "data");
const outPath = resolve(import.meta.dir, "../../content/docs/meta.json");

const classification: ClassificationEntry[] = await Bun.file(
  resolve(dataDir, "classification.json"),
).json();

const realmOrder = realmsData.realms.map((r) => r.id);
const realmIds = new Set(realmOrder);

// Files tracked at git HEAD => the authoritative public set.
const trackedFiles = new Set(
  execFileSync(
    "git",
    ["ls-tree", "-r", "HEAD", "--name-only", "--", "content/docs"],
    { encoding: "utf8" },
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
);

const isPublic = (entry: ClassificationEntry) => trackedFiles.has(entry.file);

/** Realm of an original file = its first path segment under content/docs/. */
const realmOfFile = (file: string): string | undefined => {
  const [, docs, segment] = file.split("/");
  if (docs !== "docs") return undefined;
  return realmIds.has(segment) ? segment : undefined;
};

/** Meta path reference for a page = its path under content/docs/ without extension. */
const refFromTo = (to: string): string => to.replace(/^\//, "");

/** Title-case a realm id for the section separator label. */
const sectionLabel = (realmId: string): string =>
  realmId.charAt(0).toUpperCase() + realmId.slice(1).toLowerCase();

// Per-realm buckets.
const hubByRealm = new Map<string, string>();
const productsByRealm = new Map<string, Set<string>>();
const guidesByRealm = new Map<string, Set<string>>();

for (const realm of realmOrder) {
  productsByRealm.set(realm, new Set());
  guidesByRealm.set(realm, new Set());
}

for (const entry of classification) {
  if (!entry.to || !isPublic(entry)) continue;

  const realm = realmOfFile(entry.file);
  if (!realm) continue;

  if (entry.kind === "realm-hub") {
    // Reference the hub index page as a flat entry (not the folder wrapper).
    hubByRealm.set(realm, `realms/${realm}/index`);
  } else if (entry.kind === "product") {
    // One reference per product (id = second segment of the new URL).
    const [, , id] = entry.to.split("/");
    if (id) productsByRealm.get(realm)?.add(`products/${id}`);
  } else if (entry.kind === "realm-page") {
    guidesByRealm.get(realm)?.add(refFromTo(entry.to));
  }
}

const sorted = (set: Set<string> | undefined): string[] =>
  [...(set ?? [])].sort((a, b) => a.localeCompare(b));

const pages: string[] = ["---Welcome---"];

// Ecosystem root pages that still live directly under content/docs/.
const rootEcosystemPages = [
  "index",
  "mission",
  "ethos",
  "ecosystem",
  "open-source",
];
for (const page of rootEcosystemPages) {
  if (trackedFiles.has(`content/docs/${page}.mdx`)) pages.push(page);
}

for (const realm of realmOrder) {
  pages.push(`---${sectionLabel(realm)}---`);

  const hub = hubByRealm.get(realm);
  if (hub) pages.push(hub);

  pages.push(...sorted(productsByRealm.get(realm)));
  pages.push(...sorted(guidesByRealm.get(realm)));
}

// Ecosystem sections. Folder-scoped globs are safe: they only spread pages
// within community/ and help/, never unlisted product pages.
pages.push("---Community---", "...community", "---Help---", "...help");

const meta = {
  root: true,
  title: "Welcome to Omni",
  tagline: "Open-source ecosystem",
  description: "Open-source ecosystem",
  pages,
};

await Bun.write(outPath, `${JSON.stringify(meta, null, 2)}\n`);

// biome-ignore lint/suspicious/noConsole: migration script output
console.info(
  `[root-meta] Wrote content/docs/meta.json with ${realmOrder.length} realm sections`,
);
