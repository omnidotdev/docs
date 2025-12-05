import type { KnipConfig } from "knip";

/**
 * Knip configuration.
 * @see https://knip.dev/overview/configuration
 */
const knipConfig: KnipConfig = {
  entry: ["src/**/*.ts", "src/**/*.tsx", "src/router.tsx"],
  project: ["src/**/*.{ts,tsx,css,mdx}", "content/docs/**/*.mdx"],
  ignore: ["**/*.gen.*", "**/generated/**", "src/components/ui/*.tsx"],
  // used in MDX files, not picked up by MDX compiler
  ignoreDependencies: ["@omnidotdev/garden", "react-icons"],
  tags: ["-knipignore"],
};

export default knipConfig;
