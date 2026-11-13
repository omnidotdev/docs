/**
 * Sidebar status badges ("New", "Coming soon"), derived from the omni-api
 * catalog (SSOT). Pure so the same rules apply to the live catalog fetched at
 * request time and to the vendored snapshot it falls back to.
 */

/** The catalog fields the badges depend on. */
export interface BadgeSourceProduct {
  name: string;
  status?: string;
  releaseDate?: string;
}

export interface ProductBadges {
  /** Display names badged "New". */
  newProducts: string[];
  /** Display names badged "Coming soon". */
  comingSoonProducts: string[];
}

/**
 * A product is badged "New" for this many days after its release, so it ages
 * out of the badge on its own.
 */
export const NEW_WINDOW_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

// Escape hatch to badge a product "coming soon" in the docs sidebar even when
// the catalog does not mark it so (docs-only, does not touch the SSOT or the
// website). Add a name here only for a product the catalog does not yet reflect
const DOCS_COMING_SOON_OVERRIDES: string[] = [];

const isRecentlyReleased = (releaseDate: string | undefined, now: number) => {
  if (!releaseDate) return false;

  const released = new Date(releaseDate).getTime();

  if (Number.isNaN(released)) return false;

  // a future release date has not shipped yet, so it is not "new" either
  return released <= now && now - released <= NEW_WINDOW_DAYS * DAY_MS;
};

/**
 * Derive the badge lists from catalog products. A product is either "coming
 * soon" or "new", never both: a coming-soon product has not launched, so it can
 * never also badge "New" even if it carries a recent release date.
 */
export const deriveBadges = (
  products: BadgeSourceProduct[],
  now: number = Date.now(),
): ProductBadges => {
  const comingSoonProducts = [
    ...products
      .filter((product) => product.status === "coming_soon")
      .map((product) => product.name),
    ...DOCS_COMING_SOON_OVERRIDES,
  ];

  const newProducts = products
    .filter(
      (product) =>
        !comingSoonProducts.includes(product.name) &&
        isRecentlyReleased(product.releaseDate, now),
    )
    .map((product) => product.name);

  return { newProducts, comingSoonProducts };
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Whether a sidebar label names one of the given products. Matches the whole
 * name only, so a product never lends its badge to another product whose name
 * merely contains it ("Run" must not badge "Runa"). Labels may carry an emoji
 * or markup around the name, so this is a whole-word match, not equality.
 */
export const labelNamesProduct = (label: string, names: string[]) =>
  names.some((name) =>
    new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegExp(name)}(?![\\p{L}\\p{N}])`,
      "u",
    ).test(label),
  );

/** The display text of a Fumadocs sidebar node, whatever shape its name has. */
export const sidebarLabel = (item: {
  // biome-ignore lint/suspicious/noExplicitAny: Fumadocs node names are a string or a rendered element
  name?: any;
}): string =>
  item.name?.props?.dangerouslySetInnerHTML?.__html ??
  (typeof item.name === "string" ? item.name : "");
