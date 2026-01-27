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

// TODO grab from Omni API
export const NEW_PRODUCTS = ["Eden", "Omni CLI", "RDK", "Runa"];
export const COMING_SOON_PRODUCTS = ["Thornberry", "Vortex"];

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
