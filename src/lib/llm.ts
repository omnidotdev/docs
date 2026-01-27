import type { InferPageType } from "fumadocs-core/source";

import source from "@/lib/source";

/**
 * Convert a page to LLM-readable markdown format.
 * @param page - The page to convert.
 * @returns Formatted markdown string with title and content.
 */
async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}

export default getLLMText;
