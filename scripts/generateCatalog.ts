/**
 * Generate the vendored product catalog the docs read from.
 *
 * The single source of truth is omni-api. This fetches its public catalog via
 * the shared `@omnidotdev/providers/catalog` client (already public-filtered
 * and normalized server-side) and writes a committed, typed
 * `src/lib/catalog/generated/catalog.ts`. The committed file is what the docs
 * build against, so a build without egress (CI, or an omni-api outage) still
 * ships the last good catalog; it re-runs on every build to keep it fresh.
 *
 * Two things are vendored: the fields the sidebar badges need (name, status,
 * releaseDate) and, per product, its pricing plans (tier, price, marketing
 * features, platform fee) so pricing tables in the docs render from the SSOT
 * instead of hardcoded numbers. Plans come from a second query since the
 * providers client does not fetch them. Never hand-edit `catalog.ts`.
 */

import { resolve } from "node:path";

import { fetchPublicCatalog } from "@omnidotdev/providers/catalog";

const outPath = resolve(
  import.meta.dir,
  "../src/lib/catalog/generated/catalog.ts",
);

const graphqlUrl =
  process.env.OMNI_API_GRAPHQL_URL ?? "https://api.omni.dev/graphql";

const catalog = await fetchPublicCatalog(
  process.env.OMNI_API_GRAPHQL_URL ? { url: graphqlUrl } : {},
).catch((error) => {
  // biome-ignore lint/suspicious/noConsole: build script output
  console.warn(
    `[catalog] could not reach omni-api (${error}); keeping committed generated.ts`,
  );
  return null;
});

// Keep the committed catalog when omni-api is unreachable, so a build without
// egress (or during an outage) still ships the last good catalog.
if (!catalog) process.exit(0);

// Plans are public (skipAuth) and filtered to public products server-side, but
// the providers client does not query them, so fetch them here keyed by slug.
const PLANS_QUERY = `{
  products(first: 200) {
    nodes {
      slug
      plans {
        nodes {
          name tier description monthlyPrice yearlyPrice
          planFeatures { nodes { kind featureKey value } }
        }
      }
    }
  }
}`;

interface RawPlanFeature {
  kind: string;
  featureKey: string;
  value: string;
}
interface RawPlan {
  name: string;
  tier: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  planFeatures: { nodes: RawPlanFeature[] };
}

const plansBySlug = await fetch(graphqlUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query: PLANS_QUERY }),
})
  .then((res) => {
    if (!res.ok)
      throw new Error(`omni-api ${graphqlUrl} returned ${res.status}`);
    return res.json() as Promise<{
      data?: {
        products: { nodes: { slug: string; plans: { nodes: RawPlan[] } }[] };
      };
      errors?: unknown;
    }>;
  })
  .then((body) => {
    if (body.errors || !body.data)
      throw new Error("plans query returned errors");

    const map = new Map<string, RawPlan[]>();
    for (const node of body.data.products.nodes) {
      map.set(node.slug, node.plans.nodes);
    }
    return map;
  })
  .catch((error) => {
    // biome-ignore lint/suspicious/noConsole: build script output
    console.warn(
      `[catalog] could not fetch plans (${error}); keeping committed generated.ts`,
    );
    return null;
  });

// Same rationale as above: without a full plans payload, keep the committed
// catalog rather than emitting products with their pricing stripped out.
if (!plansBySlug) process.exit(0);

/** Shape a product's raw plans into the vendored, display-ready form. */
const shapePlans = (slug: string) => {
  const raw = plansBySlug.get(slug);

  if (!raw?.length) return undefined;

  return [...raw]
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice)
    .map((plan) => {
      const feePlanFeature = plan.planFeatures.nodes.find(
        (f) => f.featureKey === "transaction_fee_bps",
      );

      return {
        tier: plan.tier,
        name: plan.name,
        description: plan.description ?? undefined,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        // Sorted for a deterministic vendored file: syncCatalog deletes and
        // reinserts plans on every catalog sync, so feature row order (and thus
        // the API's default ordering) is not stable across deploys.
        features: plan.planFeatures.nodes
          .filter((f) => f.kind === "marketing")
          .map((f) => f.value)
          .sort((a, b) => a.localeCompare(b)),
        transactionFeeBps: feePlanFeature
          ? Number(feePlanFeature.value)
          : undefined,
      };
    });
};

// Deterministic order so regenerations produce stable diffs.
const products = [...catalog.products]
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((p) => ({
    id: p.id,
    name: p.name,
    realm: p.realm,
    status: p.status,
    releaseDate: p.releaseDate,
    plans: shapePlans(p.id),
  }));

const j = (v: unknown) => JSON.stringify(v, null, 2);

const file = `/**
 * Omni product catalog, fetched from omni-api's public GraphQL surface.
 *
 * AUTO-GENERATED by scripts/generateCatalog.ts. Do not edit by hand.
 * Not linted or type-narrowed here; lives under generated/ which biome and
 * knip ignore. Refresh with \`bun run catalog:generate\`.
 */

/** A pricing plan (tier) for a product. Prices are in cents. */
export interface CatalogPlan {
  tier: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  /** Marketing feature strings shown on pricing surfaces. */
  features: string[];
  /**
   * Platform take-rate in basis points applied per sale, when the product
   * charges one (100 = 1%). Absent for products without a transaction fee.
   */
  transactionFeeBps?: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  realm: string | null;
  /** Lifecycle status, e.g. "active" or "coming_soon". */
  status?: string;
  /** ISO release date. Absent means the product has not launched yet. */
  releaseDate?: string;
  /** Pricing plans, ordered cheapest first. Absent for products without any. */
  plans?: CatalogPlan[];
}

export const products: CatalogProduct[] = ${j(products)};
`;

await Bun.write(outPath, file);

const planCount = products.filter((p) => p.plans?.length).length;

// biome-ignore lint/suspicious/noConsole: build script output
console.info(
  `[catalog] Wrote ${products.length} products (${planCount} with plans)`,
);
