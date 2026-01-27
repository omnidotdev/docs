import { defineConfig, defineDocs } from "fumadocs-mdx/config";

/**
 * Docs configuration.
 * @see https://fumadocs.dev/docs/mdx/collections#define-docs
 */
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
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
