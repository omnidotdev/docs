import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

/**
 * Docs configuration.
 * @see https://fumadocs.dev/docs/mdx/collections#define-docs
 */
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // these are set by the product-docs mirror (see `scripts/syncProductDocs.ts`)
    // on aggregated pages: `canonical` points back at the product's own docs
    // domain, `sourceUrl` links "view source" to the upstream file, and
    // `mirroredFrom` records provenance
    schema: frontmatterSchema.extend({
      canonical: z.string().optional(),
      mirroredFrom: z.string().optional(),
      sourceUrl: z.string().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

/**
 * Global configuration.
 * @see https://fumadocs.dev/docs/mdx/global
 */
const globalConfig = defineConfig();

export default globalConfig;
