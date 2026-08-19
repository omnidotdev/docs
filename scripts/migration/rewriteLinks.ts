/**
 * Rewrite legacy absolute internal links across all served docs MDX.
 *
 * Builds the old-url -> new-url map from classification.json (every product,
 * realm-hub, and realm-page whose `to` differs from its `url`), then walks every
 * .mdx under content/docs and rewrites markdown link targets of the form
 * `](/path#anchor)` via rewriteLinkTarget. Excluded pages (carbon, ember,
 * quantum, vault) are not in the map; any link that still points at one is left
 * as-is and reported, since its target no longer exists in the served tree.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { rewriteLinkTarget } from "./rewriteLinkTarget";

import type { LinkMap } from "./rewriteLinkTarget";

type Kind =
  | "product"
  | "realm-hub"
  | "realm-page"
  | "ecosystem"
  | "exclude"
  | "redirect-only";

interface Entry {
  url: string;
  file: string;
  kind: Kind;
  to: string | null;
}

const repoRoot = resolve(import.meta.dir, "../..");
const classification: Entry[] = JSON.parse(
  readFileSync(
    join(repoRoot, "scripts/migration/data/classification.json"),
    "utf8",
  ),
);

const map: LinkMap = new Map();
for (const e of classification) {
  const moved =
    e.kind === "product" || e.kind === "realm-hub" || e.kind === "realm-page";
  if (moved && e.to !== null && e.to !== e.url) map.set(e.url, e.to);
}

// Excluded legacy path prefixes whose targets no longer exist in the served tree
const excludedPrefixes = ["/carbon", "/ember", "/quantum", "/vault"];

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".mdx")) out.push(p);
  }
  return out;
};

const linkRe = /(\]\()(\/[^)\s]+)(\))/g;
const contentRoot = join(repoRoot, "content/docs");
const files = walk(contentRoot);

let rewritten = 0;
let filesChanged = 0;
const excludedLinks: { file: string; target: string }[] = [];

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let fileHits = 0;
  const updated = original.replace(linkRe, (_m, open, target, close) => {
    const path = target.split(/[#?]/)[0];
    if (excludedPrefixes.some((p) => path === p || path.startsWith(`${p}/`))) {
      excludedLinks.push({ file: file.slice(repoRoot.length + 1), target });
      return `${open}${target}${close}`;
    }
    const next = rewriteLinkTarget(target, map);
    if (next !== target) fileHits++;
    return `${open}${next}${close}`;
  });
  if (updated !== original) {
    writeFileSync(file, updated);
    rewritten += fileHits;
    filesChanged++;
  }
}

console.info(`files scanned: ${files.length}`);
console.info(`files changed: ${filesChanged}`);
console.info(`links rewritten: ${rewritten}`);
console.info(`links to excluded pages (left as-is): ${excludedLinks.length}`);
for (const l of excludedLinks) console.info(`  ${l.file}: ${l.target}`);
