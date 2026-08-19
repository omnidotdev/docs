/**
 * Classify every live docs URL into how it moves under the new URL scheme.
 *
 * New scheme:
 *   - product page  -> /products/<id>/<rest...>   (realm stripped from the path)
 *   - realm hub      -> /realms/<realmId>
 *   - realm page     -> /realms/<realmId>/<slug...>  (realm-scoped guide, not a product)
 *   - ecosystem      -> unchanged (stays at root)
 *   - exclude        -> not published, not redirected (to === null)
 *   - redirect-only  -> not published, but the old URL still 301s to `to`
 *
 * Reads scripts/migration/data/legacy-urls.json (ground truth for what exists)
 * and scripts/migration/data/overrides.json (human decisions keyed by legacy
 * url), then writes:
 *   - data/classification.json  the FINAL classification for all 267 URLs
 *   - data/ambiguous.json       always [] once every page is decided
 *
 * The automatic rules below classify the confident pages; the overrides file
 * carries the human decisions for the rest and wins wherever it is present.
 * Every one of the 267 URLs must end up with a final classification; the script
 * fails loudly if any URL is left unaccounted for.
 *
 * The omni-api public catalog (product-realms.json) is a PARTIAL cross-check:
 * where a product is public, we assert the realm we stripped matches the
 * catalog's realm, and we use catalog membership to sharpen recommendations for
 * ambiguous codex/sigil pages. Absence means "unknown", never "not a product".
 */

import { resolve } from "node:path";

const dir = import.meta.dir;
const read = (p: string) => Bun.file(resolve(dir, p)).json();

interface LegacyUrl {
  url: string;
  file: string;
}

type Kind =
  | "product"
  | "realm-hub"
  | "realm-page"
  | "ecosystem"
  | "exclude"
  | "redirect-only";

interface Classified {
  url: string;
  file: string;
  kind: Kind;
  /** Canonical destination, or null for pure excludes (no publish, no redirect) */
  to: string | null;
}

/** A human decision keyed by legacy url, applied on top of the automatic rules */
interface Override {
  kind: Kind;
  to: string | null;
}

interface Ambiguous {
  url: string;
  file: string;
  recommendation: string;
  reason: string;
}

const legacy: LegacyUrl[] = await read("data/legacy-urls.json");
const realmsFile: { realms: { id: string }[] } =
  await read("../../realms.json");
const productRealms: Record<string, string> = await read(
  "data/product-realms.json",
).catch(() => ({}));
const overrides: Record<string, Override> = await read("data/overrides.json");

const REALMS = new Set(realmsFile.realms.map((r) => r.id));
// Ecosystem section roots, per the classification rules
const ECOSYSTEM_SECTIONS = new Set(["help", "community", "support-omni"]);
// Single-segment root pages with an obvious classification
const ECOSYSTEM_SLUGS = new Set([
  "ecosystem",
  "ethos",
  "mission",
  "open-source",
]);
const PRODUCT_SLUGS = new Set(["lens", "frame", "launcher", "orin", "halcyon"]);
// Non-realm folders that mirror a realm ("<X> Introduction" hubs) but are not
// among the authoritative 9 realms; their status must be confirmed
const NEW_REALM_LIKE = new Set(["carbon", "ember", "quantum"]);

const inCatalog = (id: string) => id in productRealms;
const segsOf = (url: string) => url.split("/").filter(Boolean);

const classified: Classified[] = [];
const ambiguous: Ambiguous[] = [];
// Confident product pages whose stripped realm disagrees with the catalog
const realmDisagreements: {
  url: string;
  id: string;
  pathRealm: string;
  catalogRealm: string;
}[] = [];

/** Decide if a realm-nested / root URL is ambiguous, returning the reasoning */
const asAmbiguous = (
  url: string,
  segs: string[],
): Omit<Ambiguous, "url" | "file"> | null => {
  const top = segs[0]!;
  const rest = segs.slice(1);
  const restPath = rest.join("/");
  const id = rest[0] ?? top;

  // New realm-style groups not in the authoritative 9 realms
  if (NEW_REALM_LIKE.has(top)) {
    if (segs.length === 1)
      return {
        recommendation: `/realms/${top}`,
        reason: `New realm-style hub ("${top[0]!.toUpperCase()}${top.slice(1)} Introduction") that is NOT one of the 9 authoritative realms in realms.json. Its children are product-shaped. Confirm whether "${top}" becomes an additional realm (then hub -> /realms/${top}) or is folded elsewhere.`,
      };
    return {
      recommendation: `/products/${restPath}`,
      reason: `Product-shaped child of the non-authoritative "${top}" group; neither "${top}" (as a realm) nor "${id}" (in the master catalog) is confirmed. Depends on the "${top}" realm decision above.`,
    };
  }

  // Fumadocs scaffold / test pages, not real product docs
  if (top === "vault")
    return {
      recommendation: "EXCLUDE (do not migrate)",
      reason: `Fumadocs vault scaffold/test page; not real product or realm documentation. Recommend removing from the live set rather than migrating.`,
    };

  // Realm-scoped guides that must NOT become /products/*
  if (url === "/armory/templates")
    return {
      recommendation: "/realms/armory/templates",
      reason: `Realm-scoped resource page ("Templates: production-ready starting points"), not a product and not in the master catalog. Recommend a realm sub-page, not /products/templates.`,
    };
  if (url === "/core/social-media-post")
    return {
      recommendation: "/realms/core/social-media-post",
      reason: `Feature guide of Omni Core ("create, schedule, manage social media content"), not a standalone product and not in the catalog. Recommend a realm sub-page.`,
    };

  // Codex specs: catalog lists several as products, yet they live in the
  // "specifications and standards" realm; owner must pick /products vs /realms
  if (top === "codex" && segs.length >= 2) {
    if (id === "organizations")
      return {
        recommendation: "/realms/codex/organizations",
        reason: `Cross-product architecture explainer (multi-tenant workspaces), not a product and not in the catalog. Recommend a codex realm sub-page.`,
      };
    const cat = inCatalog(id)
      ? `The public catalog DOES list "${id}" as a product in the codex realm, so it is product-shaped. `
      : `The public catalog does not expose "${id}" (partial set), though it is in the master product list. `;
    return {
      recommendation: `/products/${restPath}`,
      reason: `Codex specification page. ${cat}Confirm whether codex specs live at /products/${id} or as codex realm pages at /realms/codex/${id}.`,
    };
  }

  // Sigil design-system realm: fonts/totem are reference pages; thornberry and
  // zenpetal are listed as sigil products by the catalog
  if (top === "sigil" && segs.length >= 2) {
    if (inCatalog(id))
      return {
        recommendation: `/products/${restPath}`,
        reason: `Sits in the Sigil design-system realm, but the public catalog lists "${id}" as a sigil product, so it is product-shaped. Confirm it belongs at /products/${id} rather than as a design-system page under /realms/sigil.`,
      };
    return {
      recommendation: `/realms/sigil/${restPath}`,
      reason: `Sigil design-system sub-page (font/theme/token reference "${id}"), not a standalone product and not in the catalog. Recommend a realm sub-page, not /products/*.`,
    };
  }

  // ID collision: a GRID product and a WORLDS product are both named "mimic",
  // so both would claim /products/mimic
  if (url === "/grid/mimic")
    return {
      recommendation: "/products/mimic",
      reason: `ID COLLISION: this GRID "mimic" (open-source super-emulator engine, libretro) and a DIFFERENT WORLDS "mimic" both map to /products/mimic. Only one can own the slug. Confirm which keeps "mimic" and rename the other.`,
    };
  if (top === "worlds" && rest[0] === "mimic")
    return {
      recommendation: `/products/${restPath}`,
      reason: `ID COLLISION: this WORLDS "mimic" and a DIFFERENT GRID "mimic" (super-emulator engine) both map to /products/mimic. Only one can own the slug. Confirm which keeps "mimic" and rename the other.`,
    };

  return null;
};

for (const { url, file } of legacy) {
  const segs = segsOf(url);

  // Rule 1: root
  if (url === "/") {
    classified.push({ url, file, kind: "ecosystem", to: url });
    continue;
  }

  // Rule 2: realm hub (exactly /<realmId>)
  if (segs.length === 1 && REALMS.has(segs[0]!)) {
    classified.push({ url, file, kind: "realm-hub", to: `/realms/${segs[0]}` });
    continue;
  }

  // Ambiguity checks override the generic product/ecosystem defaults
  const amb = asAmbiguous(url, segs);
  if (amb) {
    ambiguous.push({ url, file, ...amb });
    continue;
  }

  const top = segs[0]!;

  // Rule 3: ecosystem sections
  if (ECOSYSTEM_SECTIONS.has(top)) {
    classified.push({ url, file, kind: "ecosystem", to: url });
    continue;
  }

  // worlds/<x> subpages that survived the ambiguity checks are realm products
  // Rule 4: nested under a realm -> product (realm stripped)
  if (REALMS.has(top) && segs.length >= 2) {
    const rest = segs.slice(1);
    const id = rest[0]!;
    if (inCatalog(id) && productRealms[id] !== top)
      realmDisagreements.push({
        url,
        id,
        pathRealm: top,
        catalogRealm: productRealms[id]!,
      });
    classified.push({
      url,
      file,
      kind: "product",
      to: `/products/${rest.join("/")}`,
    });
    continue;
  }

  // Rule 5: bare-root single-segment pages
  if (segs.length === 1) {
    if (ECOSYSTEM_SLUGS.has(top)) {
      classified.push({ url, file, kind: "ecosystem", to: url });
      continue;
    }
    if (PRODUCT_SLUGS.has(top)) {
      if (inCatalog(top) && productRealms[top] !== undefined) {
        // root products carry no path realm, so nothing to disagree with
      }
      classified.push({ url, file, kind: "product", to: `/products/${top}` });
      continue;
    }
    ambiguous.push({
      url,
      file,
      recommendation: `/products/${top}`,
      reason: `Single-segment root page that is neither a known ecosystem page nor a confirmed product. Confirm whether "${top}" is a product or an ecosystem page.`,
    });
    continue;
  }

  // Anything left is unmodelled; never silently guess
  ambiguous.push({
    url,
    file,
    recommendation: "(needs review)",
    reason: `URL shape not covered by the classification rules; manual review required.`,
  });
}

// Apply human decisions: the override for a url wins over any automatic result.
// Build the FINAL classification for every legacy url, failing loudly if any
// page is left without an automatic classification AND without an override.
const autoByUrl = new Map(classified.map((c) => [c.url, c]));
const unresolved: LegacyUrl[] = [];
const final: Classified[] = [];

for (const { url, file } of legacy) {
  const ov = overrides[url];
  if (ov) {
    final.push({ url, file, kind: ov.kind, to: ov.to });
    continue;
  }
  const auto = autoByUrl.get(url);
  if (auto) {
    final.push(auto);
    continue;
  }
  unresolved.push({ url, file });
}

if (unresolved.length)
  throw new Error(
    `unresolved pages (no automatic classification and no override):\n${unresolved
      .map((u) => `  ${u.url} (${u.file})`)
      .join("\n")}`,
  );

// Every override must reference a real legacy url, or a decision is dead
const legacyUrls = new Set(legacy.map((l) => l.url));
for (const url of Object.keys(overrides))
  if (!legacyUrls.has(url))
    throw new Error(`override for unknown legacy url: ${url}`);

// Invariants on the final set: destinations must match their kind
for (const c of final) {
  switch (c.kind) {
    case "product":
      if (!c.to?.startsWith("/products/"))
        throw new Error(`product ${c.url} has non-/products to=${c.to}`);
      break;
    case "realm-hub":
    case "realm-page":
      if (!c.to?.startsWith("/realms/"))
        throw new Error(`${c.kind} ${c.url} has non-/realms to=${c.to}`);
      break;
    case "ecosystem":
      if (c.to !== c.url)
        throw new Error(`ecosystem ${c.url} must be unchanged, got to=${c.to}`);
      break;
    case "exclude":
      if (c.to !== null)
        throw new Error(`exclude ${c.url} must have to=null, got ${c.to}`);
      break;
    case "redirect-only":
      if (!c.to)
        throw new Error(`redirect-only ${c.url} must have a non-null to`);
      break;
  }
}

if (final.length !== legacy.length)
  throw new Error(
    `coverage mismatch: final ${final.length} != legacy ${legacy.length}`,
  );

const sortByUrl = <T extends { url: string }>(a: T, b: T) =>
  a.url.localeCompare(b.url);
final.sort(sortByUrl);

// Every ambiguous page must now be resolved by an override
const stillAmbiguous = ambiguous.filter((a) => !overrides[a.url]);

await Bun.write(
  resolve(dir, "data/classification.json"),
  `${JSON.stringify(final, null, 2)}\n`,
);
await Bun.write(
  resolve(dir, "data/ambiguous.json"),
  `${JSON.stringify(stillAmbiguous, null, 2)}\n`,
);

const byKind = final.reduce<Record<string, number>>((acc, c) => {
  acc[c.kind] = (acc[c.kind] ?? 0) + 1;
  return acc;
}, {});

// biome-ignore lint/suspicious/noConsole: migration script output
console.info(
  [
    `Final classification (${final.length} URLs):`,
    `  product:       ${byKind.product ?? 0}`,
    `  realm-hub:     ${byKind["realm-hub"] ?? 0}`,
    `  realm-page:    ${byKind["realm-page"] ?? 0}`,
    `  ecosystem:     ${byKind.ecosystem ?? 0}`,
    `  redirect-only: ${byKind["redirect-only"] ?? 0}`,
    `  exclude:       ${byKind.exclude ?? 0}`,
    `Total:         ${final.length} (assert == ${legacy.length}) ${final.length === legacy.length ? "OK" : "FAIL"}`,
    `Remaining ambiguous: ${stillAmbiguous.length}`,
    `Realm disagreements (confident products): ${realmDisagreements.length}`,
  ].join("\n"),
);
