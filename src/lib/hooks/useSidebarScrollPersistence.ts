import { useEffect } from "react";

/**
 * Hook to scroll the active sidebar item into view on initial load.
 */
export function useSidebarScrollPersistence() {
  useEffect(() => {
    // Find the sidebar's scrollable element
    const findScrollableElement = (): Element | null => {
      const selectors = [
        "aside [data-radix-scroll-area-viewport]",
        "aside .fd-sidebar-viewport",
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.scrollHeight > element.clientHeight) {
          return element;
        }
      }

      return null;
    };

    // Scroll active item into view
    const scrollToActiveItem = () => {
      const scrollElement = findScrollableElement();
      if (!scrollElement) return;

      const activeItem = scrollElement.querySelector("[data-active='true']");
      if (!activeItem) return;

      const scrollRect = scrollElement.getBoundingClientRect();
      const activeRect = activeItem.getBoundingClientRect();
      const relativeTop =
        activeRect.top - scrollRect.top + scrollElement.scrollTop;
      const centeredPosition =
        relativeTop - scrollRect.height / 2 + activeRect.height / 2;

      scrollElement.scrollTop = Math.max(0, centeredPosition);
    };

    // Scroll on initial load after DOM settles
    const timeout = setTimeout(scrollToActiveItem, 100);

    return () => clearTimeout(timeout);
  }, []);
}
