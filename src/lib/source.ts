import { docs } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { createElement } from "react";
import { icons } from "lucide-react";

// TODO remote MDX sources https://fumadocs.dev/docs/mdx/performance#remote-source

/**
 * Content source loader.
 * @see https://fumadocs.dev/docs/headless/source-api
 */
const source = loader({
  icon: (icon) => {
    if (!icon) return;

    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  // TODO consolidate icon libs, currently using `react-icons` and `lucide-react`
  plugins: [lucideIconsPlugin()],
});

export default source;
