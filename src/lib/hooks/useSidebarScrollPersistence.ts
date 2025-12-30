import { useEffect } from "react";

/**
 * Hook to scroll the active sidebar item into view after navigation.
 * Uses a simple approach: listen for clicks on sidebar links and scroll after navigation.
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

      // Calculate position relative to scroll container and scroll manually
      const scrollRect = scrollElement.getBoundingClientRect();
      const activeRect = activeItem.getBoundingClientRect();
      const relativeTop =
        activeRect.top - scrollRect.top + scrollElement.scrollTop;
      const centeredPosition =
        relativeTop - scrollRect.height / 2 + activeRect.height / 2;

      scrollElement.scrollTop = Math.max(0, centeredPosition);
    };

    // Scroll on initial load after a delay to let DOM settle
    const initialTimeout = setTimeout(scrollToActiveItem, 100);

    // Watch for URL changes using popstate and click events on sidebar links
    const handleNavigation = () => {
      // Wait for React to update the DOM with new active state
      setTimeout(scrollToActiveItem, 100);
      setTimeout(scrollToActiveItem, 300);
    };

    // Listen for browser back/forward
    window.addEventListener("popstate", handleNavigation);

    // Listen for clicks on sidebar links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("aside a[href]");
      if (link) {
        handleNavigation();
      }
    };
    document.addEventListener("click", handleClick);

    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener("popstate", handleNavigation);
      document.removeEventListener("click", handleClick);
    };
  }, []);
}
