import { PILLARS } from "./pillars";

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
export const NEW_PRODUCTS = ["RDK"];
export const COMING_SOON_PRODUCTS = ["Runa", "Thornberry"];

// TODO augment section metadata directly (unsure if this is possible with Fumadocs)

// TODO narrow type (can validate `meta.json` against schema)
/**
 * Get the description of a section.
 * @param sectionName - The name of the section.
 * @returns The description of the section.
 */
const getDescription = (sectionName: string) => {
  const lowerName = sectionName.toLowerCase();

  // Find matching pillar by checking if the section name contains the pillar ID
  const matchingPillar = PILLARS.find((pillar) =>
    lowerName.includes(pillar.id),
  );

  if (matchingPillar) {
    // Return JSX with proper HTML entities
    const description = matchingPillar.description;
    if (description.includes("&")) {
      return <>{description}</>;
    }
    return <>{description}</>;
  }

  return null;
};

export default getDescription;
