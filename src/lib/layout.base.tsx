import {
  FaEarthAmericas as EarthIcon,
  FaLinkedin,
  FaRegNewspaper,
} from "react-icons/fa6";
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
      icon: <FaRegNewspaper />,
      text: "Blog",
      url: app.organization.blog,
    },
    {
      icon: <XIcon />,
      text: `@${app.socials.x.split("/")[3]}`,
      url: app.socials.x,
    },
    {
      icon: <FaLinkedin />,
      text: "LinkedIn",
      url: app.socials.linkedin,
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
    {
      text: "🛍️ Shop Omni Merch (Soon)",
      url: app.merchUrl,
    },
  ],
  githubUrl: app.socials.github,
  // TODO vendor-agnostic search (e.g. no command key on non-MacOS)
  // searchToggle: ...
  nav: {
    title: (
      <img
        src="/svg/logo.svg"
        alt="Omni Logo"
        className="h-8 w-auto opacity-80 invert-0 dark:invert"
      />
    ),
  },
});

export default baseLayoutOptions;
