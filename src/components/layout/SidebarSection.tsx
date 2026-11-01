import {
  Box,
  Brush,
  ChevronRight,
  FileCode,
  Glasses,
  Globe,
  Hammer,
  Heart,
  HelpCircle,
  Palette,
  Server,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback } from "react";
import { SiX } from "react-icons/si";

import getSectionDescription from "@/lib/getSectionDescription";
import getSectionGradient from "@/lib/getSectionGradient";
import { REALM_IDS, SECTION_ICONS } from "@/lib/sections";
import getSectionTextColors from "@/lib/util/getSectionTextColors";
import { cn } from "@/lib/utils";

import type { VirtualFolder } from "@/lib/pageTreeTransform";

/** Map icon names to Lucide components */
const ICON_COMPONENTS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Sparkles,
  Box,
  Heart,
  Brush,
  Server,
  Hammer,
  FileCode,
  Palette,
  Glasses,
  Globe,
  Users,
  HelpCircle,
};

// Find the live sidebar scroll viewport. Fumadocs renders the mobile sidebar as
// a separate `#nd-sidebar-mobile` drawer, so prefer it when it is mounted (the
// drawer only exists while open) and fall back to the desktop `#nd-sidebar`
const getScrollViewport = (): HTMLElement | null =>
  document.querySelector<HTMLElement>(
    "#nd-sidebar-mobile [data-radix-scroll-area-viewport]",
  ) ??
  document.querySelector<HTMLElement>(
    "#nd-sidebar [data-radix-scroll-area-viewport]",
  );

interface SidebarSectionProps {
  item: VirtualFolder;
  children: React.ReactNode;
  sectionId: string;
  isOpen: boolean;
  onToggle: (newOpen: boolean) => void;
  originalSeparator: any;
}

/**
 * Sidebar expandable section.
 */
const SidebarSection = ({
  item,
  children,
  sectionId,
  isOpen,
  onToggle,
  originalSeparator,
}: SidebarSectionProps) => {
  const textColors = getSectionTextColors(sectionId, isOpen);

  const iconName = SECTION_ICONS[sectionId];

  // use pre-computed count from page tree transform (excludes index pages, counts nested items)
  const docCount = item.docCount ?? 0;

  const isRealm = REALM_IDS.includes(sectionId);

  const IconComponent = iconName ? ICON_COMPONENTS[iconName] : null;

  const handleToggle = useCallback(() => {
    // Fumadocs' sidebar scrolls inside a Radix ScrollArea whose viewport wraps
    // content in a `display: table` element, which disables the browser's native
    // scroll anchoring. Without compensation the list jumps when a section
    // expands or collapses. Pin the live viewport's scroll position across the
    // React re-render and the 200ms collapse animation, on the desktop sidebar
    // and the mobile drawer alike (an earlier fix handled only desktop, so
    // mobile was left to jump).
    const viewport = getScrollViewport();
    const top = viewport?.scrollTop ?? 0;

    onToggle(!isOpen);

    if (!viewport) return;

    const restore = () => {
      viewport.scrollTop = top;
    };

    // Immediately, after the re-render paints, and once more after the collapse
    // animation and Radix's resize observer settle
    restore();
    requestAnimationFrame(restore);
    setTimeout(restore, 120);
  }, [onToggle, isOpen]);

  return (
    <div className="my-1">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "group w-full cursor-pointer select-none text-left",
          "inline-flex w-full items-center gap-2 rounded-md p-2 transition-all duration-200 [&_svg]:size-4 [&_svg]:shrink-0",
          getSectionGradient(sectionId, isOpen),
          getSectionGradient(sectionId, false, true),
        )}
      >
        <div className="flex-1">
          <span
            className={cn(
              "flex items-center gap-2 font-bold",
              textColors.title,
            )}
          >
            {IconComponent && <IconComponent className="h-4 w-4" />}
            {item.name}
            {isRealm && (
              <span className="text-2xs opacity-50">
                {docCount > 0 ? docCount : "Soon"}
              </span>
            )}
          </span>

          <span
            className={cn(
              "mt-1 line-clamp-1 text-fd-muted-foreground text-xs italic",
              textColors.description,
            )}
          >
            {getSectionDescription(
              originalSeparator?.name?.props?.dangerouslySetInnerHTML?.__html,
            )}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 text-fd-muted-foreground",
              isOpen && "text-current",
            )}
          />
        </motion.div>
      </button>

      <div className="sidebar-collapse mt-1" data-open={isOpen}>
        <div className="space-y-1">
          {children}

          {docCount <= 0 && (
            <div className="flex flex-col items-center py-3 text-fd-muted-foreground text-xs italic">
              <span>
                {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}{" "}
                products coming soon!
              </span>
              <span>
                Follow{" "}
                <a
                  href="https://x.com/omnidotdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline hover:text-fd-foreground"
                >
                  @omnidotdev <SiX className="inline h-3 w-3" />
                </a>{" "}
                for updates
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarSection;
