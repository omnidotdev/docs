import FumadocsLink from "fumadocs-core/link";
import { SiGithub as GitHubIcon } from "react-icons/si";
import { FaEarthAmericas as EarthIcon } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import type { LinkProps } from "fumadocs-core/link";
import type { ReactNode } from "react";

export interface Link {
  /**
   * URL.
   */
  href: string;
  /**
   * Link label to display.
   */
  label: string;
  /**
   * Link type that determines the icon.
   */
  type: "website" | "repository" | "custom";
  /**
   * Custom icon for type="custom".
   */
  icon?: ReactNode;
}

interface Props extends LinkProps {
  link: Link;
}

/**
 * Link button.
 */
const LinkButton = ({ link, ...rest }: Props) => {
  const getIcon = (link: Link) => {
    if (link.type === "website") return <EarthIcon />;
    if (link.type === "repository") return <GitHubIcon />;

    return link.icon || null;
  };

  const btn = (
    <Button size="sm" variant="outline" color="foreground.default">
      <div className="flex items-center gap-2">
        {getIcon(link)}

        {link.label}
      </div>
    </Button>
  );

  // render external link
  if (link.href.startsWith("https://"))
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" {...rest}>
        {btn}
      </a>
    );

  // render internal link
  return <FumadocsLink {...rest}>{btn}</FumadocsLink>;
};

export default LinkButton;
