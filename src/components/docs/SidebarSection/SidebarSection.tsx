import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "fumadocs-ui/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
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

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      // Save scroll position before toggle
      const viewport = getScrollViewport();
      if (viewport) {
        scrollPosRef.current = viewport.scrollTop;
      }

      onToggle(newOpen);

      // Restore scroll position after React re-render
      requestAnimationFrame(() => {
        const vp = getScrollViewport();
        if (vp) {
          vp.scrollTop = scrollPosRef.current;
        }
      });
    },
    [onToggle],
  );

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger asChild>
        <motion.div
          className="group w-full cursor-pointer select-none text-left"
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <motion.div
            className={cn(
              "inline-flex w-full items-center gap-2 rounded-md p-2 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 [&_svg]:size-4 [&_svg]:shrink-0",
              getSectionGradient(sectionId, isOpen),
              !isOpen && getSectionGradient(sectionId, false, true),
            )}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="flex-1">
              <motion.span
                className={cn(
                  "flex items-center gap-2 font-bold",
                  textColors.title,
                )}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {item.icon}
                {item.name}
              </motion.span>

              <motion.span
                className={cn(
                  "mt-1 block text-fd-muted-foreground text-sm italic",
                  textColors.description,
                )}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {getSectionDescription(
                  originalSeparator?.name?.props?.dangerouslySetInnerHTML
                    ?.__html,
                )}
              </motion.span>
            </div>

            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ x: 2, scale: 1.1 }}
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-fd-muted-foreground",
                  isOpen && "text-current",
                )}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-1 pt-1">{children}</div>
      </CollapsibleContent>

      <hr className="my-2" />
    </Collapsible>
  );
};

export default SidebarSection;
