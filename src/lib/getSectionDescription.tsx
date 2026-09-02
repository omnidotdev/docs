import { products } from "./catalog/generated/catalog";
import { REALMS } from "./sections";

// TODO extract to frontmatter
// can be extended in source config e.g.
// ```
//  docs: {
//    schema: frontmatterSchema.extend({
//      new: z.boolean().default(false),
//    }),
//  },
// ````
// then need to figure a way to grab the frontmatter here

/**
 * A product is badged "New" for this many days after its release. Derived from
 * the catalog `releaseDate` so a product ages out of the badge on its own,
 * without a rebuild.
 */
const NEW_WINDOW_DAYS = 90;

const isRecentlyReleased = (releaseDate?: string) => {
  if (!releaseDate) return false;

  const released = new Date(releaseDate).getTime();

  if (Number.isNaN(released)) return false;

  return Date.now() - released <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

// Sidebar status badges derive from the omni-api catalog (SSOT), vendored into
// `catalog/generated/catalog.ts` at build time. Matched against sidebar item
// names, so these hold product display names.
export const NEW_PRODUCTS = products
  .filter((product) => isRecentlyReleased(product.releaseDate))
  .map((product) => product.name);
// Products presented as "coming soon" in the docs sidebar regardless of catalog
// status. Docs-only, does not touch the catalog SSOT or the website.
//   - Arbor: app is live but its documentation is still being finalized, so it
//     is badged here until the docs are ready. Remove once the docs are complete.
//   - Herald, Nectar: marked `coming_soon` in the omni-api catalog SSOT but with
//     `isPublic: false`, so the public catalog (which the badge derives from)
//     excludes them. Badged here so the docs sidebar reflects their status.
//     Remove once the SSOT flips them to `isPublic: true` and the vendored
//     catalog is regenerated (they will then badge via the catalog path).
const DOCS_COMING_SOON_OVERRIDES = ["Arbor", "Herald", "Nectar"];

export const COMING_SOON_PRODUCTS = [
  ...products
    .filter((product) => product.status === "coming_soon")
    .map((product) => product.name),
  ...DOCS_COMING_SOON_OVERRIDES,
];

// TODO augment section metadata directly (unsure if this is possible with Fumadocs)

/**
 * Get the description of a section.
 * @param sectionName - The name of the section.
 * @returns The description of the section.
 */
// TODO narrow type (can validate `meta.json` against schema)
const getSectionDescription = (sectionName: string) => {
  const lowerName = sectionName.toLowerCase();

  // find matching realm by checking if the section name contains the realm ID
  const matchingRealm = REALMS.find((realm) => lowerName.includes(realm.id));

  if (matchingRealm) {
    const description = matchingRealm.tagline;

    if (description.includes("&")) return <>{description}</>;

    return <>{description}</>;
  }

  return null;
};

export default getSectionDescription;
