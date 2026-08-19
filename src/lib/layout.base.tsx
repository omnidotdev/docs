import {
  FaEarthAmericas as EarthIcon,
  FaLinkedin,
  FaRegNewspaper,
} from "react-icons/fa6";
import {
  SiDiscord as DiscordIcon,
  SiInstagram as InstagramIcon,
  SiThreads as ThreadsIcon,
  SiTiktok as TiktokIcon,
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
      text: "🛍️ Shop Omni Merch (Soon)",
      url: app.merchUrl,
    },
    // social links
    {
      type: "icon",
      icon: <XIcon />,
      text: "X",
      url: app.socials.x,
      secondary: true,
    },
    {
      type: "icon",
      icon: <FaLinkedin />,
      text: "LinkedIn",
      url: app.socials.linkedin,
      secondary: true,
    },
    {
      type: "icon",
      icon: <DiscordIcon />,
      text: "Discord",
      url: app.socials.discord,
      secondary: true,
    },
    {
      type: "icon",
      icon: <InstagramIcon />,
      text: "Instagram",
      url: app.socials.instagram,
      secondary: true,
    },
    {
      type: "icon",
      icon: <TiktokIcon />,
      text: "TikTok",
      url: app.socials.tiktok,
      secondary: true,
    },
    {
      type: "icon",
      icon: <ThreadsIcon />,
      text: "Threads",
      url: app.socials.threads,
      secondary: true,
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
