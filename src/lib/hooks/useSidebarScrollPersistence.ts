import { useEffect, useRef } from "react";

const SCROLL_STORAGE_KEY = "sidebar-scroll-position";

/**
 * Hook to persist sidebar scroll position across navigation.
 * Saves scroll position before navigation and restores it after.
 */
export function useSidebarScrollPersistence() {
  const hasRestoredRef = useRef(false);

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

    // Save current scroll position to sessionStorage
    const saveScrollPosition = () => {
      const scrollElement = findScrollableElement();
      if (scrollElement) {
        sessionStorage.setItem(
          SCROLL_STORAGE_KEY,
          String(scrollElement.scrollTop),
        );
      }
    };

    // Restore scroll position from sessionStorage
    const restoreScrollPosition = () => {
      const scrollElement = findScrollableElement();
      if (!scrollElement) return false;

      const savedPosition = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (savedPosition !== null) {
        scrollElement.scrollTop = Number(savedPosition);
        return true;
      }
      return false;
    };

    // Scroll active item into view (only used on first visit)
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

    // On initial load, try to restore scroll position, otherwise scroll to active item
    const initialTimeout = setTimeout(() => {
      if (!hasRestoredRef.current) {
        const restored = restoreScrollPosition();
        if (!restored) {
          scrollToActiveItem();
        }
        hasRestoredRef.current = true;
      }
    }, 50);

    // Handle navigation - restore scroll position after DOM updates
    const handleNavigation = () => {
      setTimeout(restoreScrollPosition, 50);
    };

    // Listen for browser back/forward
    window.addEventListener("popstate", handleNavigation);

    // Listen for clicks on sidebar links - save position before navigation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("aside a[href]");
      if (link) {
        saveScrollPosition();
        // Restore after navigation completes
        setTimeout(restoreScrollPosition, 50);
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
