import { fetchPublicCatalog } from "@omnidotdev/providers/catalog";
import { createServerFn } from "@tanstack/react-start";

import { deriveBadges } from "@/lib/catalog/badges";
import { products as vendoredProducts } from "@/lib/catalog/generated/catalog";

import type { BadgeSourceProduct, ProductBadges } from "@/lib/catalog/badges";

/** How long a fetched catalog is reused before omni-api is asked again. */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Give up on omni-api quickly so a slow catalog never delays a page */
const FETCH_TIMEOUT_MS = 3000;

/** After a failed fetch, serve the fallback this long before trying again */
const RETRY_AFTER_FAILURE_MS = 60 * 1000;

const graphqlUrl = process.env.OMNI_API_GRAPHQL_URL;

let cached: { products: BadgeSourceProduct[]; fetchedAt: number } | null = null;
let inflight: Promise<BadgeSourceProduct[]> | null = null;

const fetchLiveProducts = async (): Promise<BadgeSourceProduct[]> => {
  const catalog = await Promise.race([
    fetchPublicCatalog(graphqlUrl ? { url: graphqlUrl } : {}),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`timed out after ${FETCH_TIMEOUT_MS}ms`)),
        FETCH_TIMEOUT_MS,
      ),
    ),
  ]);

  return catalog.products.map(({ name, status, releaseDate }) => ({
    name,
    status,
    releaseDate,
  }));
};

/**
 * Current catalog products for badging. The catalog changes in omni-api
 * without this app being rebuilt (a launch flips `status`, a release sets
 * `releaseDate`), so read it live with a short cache instead of trusting the
 * snapshot vendored at build time. Falls back to the last good fetch, then to
 * the vendored snapshot, so an omni-api outage never breaks the sidebar.
 */
const getBadgeProducts = async (): Promise<BadgeSourceProduct[]> => {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS)
    return cached.products;

  inflight ??= fetchLiveProducts()
    .then((products) => {
      cached = { products, fetchedAt: Date.now() };

      return products;
    })
    .catch((error) => {
      console.warn(`[catalog] live fetch failed, using fallback: ${error}`);

      const products = cached?.products ?? vendoredProducts;

      // back off so an outage costs one slow request per minute, not every one
      cached = {
        products,
        fetchedAt: Date.now() - CACHE_TTL_MS + RETRY_AFTER_FAILURE_MS,
      };

      return products;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
};

/**
 * Sidebar status badges from the live catalog.
 */
const getCatalogBadges = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductBadges> => deriveBadges(await getBadgeProducts()),
);

export default getCatalogBadges;
