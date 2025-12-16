import { Badge } from "@/components/ui/badge";
import {
  COMING_SOON_PRODUCTS,
  NEW_PRODUCTS,
} from "@/lib/getSectionDescription";

interface SidebarItemProps {
  item: any;
  pathname: string;
}

const SidebarItem = ({ item, pathname }: SidebarItemProps) => {
  return (
    <a
      data-active={item.url === pathname}
      data-status={item.url === pathname && "active"}
      aria-current="page"
      href={item.url}
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

      {/* TODO convert to frontmatter (see note near top of file) */}
      {NEW_PRODUCTS.some((product) =>
        item.name?.props?.dangerouslySetInnerHTML?.__html?.includes(product),
      ) && (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          New! 🚀
        </Badge>
      )}

      {COMING_SOON_PRODUCTS.some((product) =>
        item.name?.props?.dangerouslySetInnerHTML?.__html?.includes(product),
      ) && (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Coming Soon 🚧
        </Badge>
      )}
    </a>
  );
};

export default SidebarItem;
