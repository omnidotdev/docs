/**
 * Fetch the omni-api PUBLIC product catalog and emit a productId -> realmId map.
 *
 * This is the cross-check set for the URL-restructure migration: the docs cover
 * ~70 products, but the public catalog only exposes ~21. So this map is a
 * PARTIAL verifier used to assert that, where a product is public, the realm we
 * stripped from its docs path matches the realm omni-api assigns it. Absence
 * from this map means "unknown to the public catalog", never "not a product".
 *
 * Mirrors scripts/generateCatalog.ts: fetches via the shared
 * `@omnidotdev/providers/catalog` client and, if omni-api is unreachable, exits
 * gracefully while keeping any existing product-realms.json in place.
 */

import { resolve } from "node:path";

import { fetchPublicCatalog } from "@omnidotdev/providers/catalog";

const outPath = resolve(import.meta.dir, "data/product-realms.json");

const catalog = await fetchPublicCatalog(
  process.env.OMNI_API_GRAPHQL_URL
    ? { url: process.env.OMNI_API_GRAPHQL_URL }
    : {},
).catch((error) => {
  // biome-ignore lint/suspicious/noConsole: migration script output
  console.warn(
    `[product-realms] could not reach omni-api (${error}); keeping existing product-realms.json`,
  );
  return null;
});

// Keep any committed map when omni-api is unreachable, so the classifier can
// still run against the last good cross-check set.
if (!catalog) process.exit(0);

// Deterministic key order so regenerations produce stable diffs.
const map: Record<string, string> = {};
for (const p of [...catalog.products].sort((a, b) =>
  a.id.localeCompare(b.id),
)) {
  if (p.realm) map[p.id] = p.realm;
}

await Bun.write(outPath, `${JSON.stringify(map, null, 2)}\n`);

// biome-ignore lint/suspicious/noConsole: migration script output
console.info(
  `[product-realms] Wrote ${Object.keys(map).length} product -> realm entries`,
);
