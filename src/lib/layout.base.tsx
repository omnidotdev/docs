import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { EarthIcon } from "lucide-react";

import { app } from "./config";

import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Base layout options.
 */
const baseLayoutOptions = (): BaseLayoutProps => ({
  links: [
    {
      icon: <EarthIcon />,
      text: "Website",
      url: app.organization.website,
    },
    {
      icon: <SiX />,
      text: `@${app.socials.x.split("/")[3]}`,
      url: app.socials.x,
    },
    {
      icon: <SiGithub />,
      text: "GitHub",
      url: app.socials.github,
    },
    // TODO LinkedIn (see https://github.com/simple-icons/simple-icons/issues/11372)
  ],
  nav: {
    title: app.name.short,
  },
});

export default baseLayoutOptions;
