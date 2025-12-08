import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// import mkcert from "vite-plugin-mkcert";

import * as mdxConfig from "./source.config";

/**
 * Vite configuration.
 * @see https://vite.dev/config
 */
const viteConfig = defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  ssr: {
    noExternal: ["@omnidotdev/garden"],
  },
  optimizeDeps: {
    include: ["@omnidotdev/garden", "@xyflow/react", "react", "react-dom"],
  },
  plugins: [
    devtools(),
    // TODO enable, dev breaks
    // mkcert(),
    mdx(mdxConfig),
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      prerender: {
        // TODO enable, build breaks
        // enabled: true,
      },
    }),
    react(),
    // see https://tanstack.com/start/latest/docs/framework/react/guide/hosting for hosting config
    nitro(),
  ],
});

export default viteConfig;
