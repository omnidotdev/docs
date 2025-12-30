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
import { Children, useCallback, useRef } from "react";
import { SiX } from "react-icons/si";

import getSectionDescription from "@/lib/getSectionDescription";
import getSectionGradient from "@/lib/getSectionGradient";
import { REALM_IDS, SECTION_ICONS } from "@/lib/sections";
import getSectionTextColors from "@/lib/util/getSectionTextColors";
import { cn } from "@/lib/utils";

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

// Find the sidebar scroll viewport
const getScrollViewport = (): HTMLElement | null => {
  // Fumadocs uses a scroll viewport inside the sidebar
  return document.querySelector(
    "#nd-sidebar [data-radix-scroll-area-viewport]",
  ) as HTMLElement | null;
};

interface SidebarSectionProps {
  item: any;
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
  const scrollPosRef = useRef<number>(0);

  const iconName = SECTION_ICONS[sectionId];

  const childCount = Children.count(children);

  // subtract 1 to exclude the index/introduction page from the count
  const docCount = childCount - 1;

  const isRealm = REALM_IDS.includes(sectionId);

  const IconComponent = iconName ? ICON_COMPONENTS[iconName] : null;

  const handleToggle = useCallback(() => {
    // Save scroll position before toggle
    const viewport = getScrollViewport();
    if (viewport) {
      scrollPosRef.current = viewport.scrollTop;
    }

    onToggle(!isOpen);

    // Restore scroll position after React re-render
    requestAnimationFrame(() => {
      const vp = getScrollViewport();
      if (vp) {
        vp.scrollTop = scrollPosRef.current;
      }
    });
  }, [onToggle, isOpen]);

  return (
    <div className="my-2">
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
                {docCount > 1 ? docCount : "Soon"}
              </span>
            )}
          </span>

          <span
            className={cn(
              "mt-1 block text-fd-muted-foreground text-xs italic",
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

      <div className="sidebar-collapse" data-open={isOpen}>
        <div>
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
