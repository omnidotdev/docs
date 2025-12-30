import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef } from "react";

import getSectionDescription from "@/lib/getSectionDescription";
import getSectionGradient from "@/lib/getSectionGradient";
import getSectionTextColors from "@/lib/util/getSectionTextColors";
import { cn } from "@/lib/utils";

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
    <div>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "group w-full cursor-pointer select-none text-left",
          "inline-flex w-full items-center gap-2 rounded-md p-2 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 [&_svg]:size-4 [&_svg]:shrink-0",
          getSectionGradient(sectionId, isOpen),
          !isOpen && getSectionGradient(sectionId, false, true),
        )}
      >
        <div className="flex-1">
          <span
            className={cn(
              "flex items-center gap-2 font-bold",
              textColors.title,
            )}
          >
            {item.icon}
            {item.name}
          </span>

          <span
            className={cn(
              "mt-1 block text-fd-muted-foreground text-sm italic",
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

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="space-y-1 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <hr className="my-2" />
    </div>
  );
};

export default SidebarSection;
