import docsMeta from "../../content/docs/meta.json";
import realmsData from "../../realms.json";

/** Matches a sidebar separator entry, e.g. "---Grid---". */
const SEPARATOR = /^---(.+)---$/;

/** Matches a top-level product entry, e.g. "products/vortex". */
const PRODUCT_ENTRY = /^products\/([^/]+)$/;

/**
 * Derive the product -> realm map from a root `meta.json` pages list.
 *
 * The root nav groups products under one separator per realm ("---Grid---"),
 * so a product's realm is the realm whose separator it sits under. Separators
 * that are not realms (Welcome, Learn, Community, Help) end the realm scope.
 * @param pages Root `meta.json` pages, in sidebar order.
 * @param realmIds Valid realm ids.
 * @returns Product id to realm id, in sidebar order.
 */
export const deriveProductRealms = (
  pages: readonly string[],
  realmIds: readonly string[],
): Record<string, string> => {
  const map: Record<string, string> = {};
  let currentRealm: string | undefined;

  for (const page of pages) {
    const separator = page.match(SEPARATOR)?.[1];

    if (separator) {
      const id = separator.trim().toLowerCase();
      currentRealm = realmIds.includes(id) ? id : undefined;
      continue;
    }

    const productId = page.match(PRODUCT_ENTRY)?.[1];

    if (productId && currentRealm) map[productId] = currentRealm;
  }

  return map;
};

/**
 * Public product -> realm map, derived from the root docs nav.
 *
 * Derived at import time from `content/docs/meta.json` (the committed sidebar,
 * which only lists launched products) rather than generated into a separate
 * file, so adding a product to the nav is the only step needed and the two can
 * never drift.
 */
export const PRODUCT_REALMS: Record<string, string> = deriveProductRealms(
  docsMeta.pages,
  realmsData.realms.map((realm) => realm.id),
);
