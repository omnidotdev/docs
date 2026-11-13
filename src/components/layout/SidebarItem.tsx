import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { labelNamesProduct, sidebarLabel } from "@/lib/catalog/badges";

import type { ProductBadges } from "@/lib/catalog/badges";

interface SidebarItemProps {
  item: any;
  pathname: string;
  badges: ProductBadges;
}

const SidebarItem = ({ item, pathname, badges }: SidebarItemProps) => {
  const isActive = item.url === pathname;
  const label = sidebarLabel(item);

  return (
    <Link
      data-active={isActive}
      data-status={isActive && "active"}
      aria-current="page"
      to={item.url}
      className="wrap-anywhere active relative flex flex-row items-center justify-between gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors [&_svg]:size-4 [&_svg]:shrink-0"
    >
      <span
        className={`flex items-center gap-2 ${
          // visually nest if child of folder
          item.isChildOfFolder ? "ps-[calc(2*var(--spacing))]" : ""
        }`}
      >
        {item.icon}
        {item.name}
      </span>

      {labelNamesProduct(label, badges.newProducts) && (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          New! 🚀
        </Badge>
      )}

      {labelNamesProduct(label, badges.comingSoonProducts) && (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Coming Soon 🚧
        </Badge>
      )}
    </Link>
  );
};

export default SidebarItem;
