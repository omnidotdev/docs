import { FaEarthAmericas as EarthIcon } from "react-icons/fa6";
import {
  SiDiscord as DiscordIcon,
  SiGithub as GitHubIcon,
  SiX as XIcon,
} from "react-icons/si";

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
      icon: <XIcon />,
      text: `@${app.socials.x.split("/")[3]}`,
      url: app.socials.x,
    },
    {
      icon: <GitHubIcon />,
      text: "GitHub",
      url: app.socials.github,
    },
    {
      icon: <DiscordIcon />,
      text: "Discord",
      url: app.socials.discord,
    },
    // TODO LinkedIn (see https://github.com/simple-icons/simple-icons/issues/11372)
  ],
  nav: {
    title: app.name.short,
  },
});

export default baseLayoutOptions;
