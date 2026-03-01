import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const VIEWPORT_SELECTORS = [
  "aside [data-radix-scroll-area-viewport]",
  "aside .fd-sidebar-viewport",
];

/** Find the sidebar's scrollable element */
const findScrollableElement = (): Element | null => {
  for (const selector of VIEWPORT_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) return element;
  }

  return null;
};

// Module-level scroll position survives component re-mounts
let savedScrollTop: number | null = null;

/**
 * Hook to preserve sidebar scroll position across navigations
 * and center the active item on initial load.
 */
export function useSidebarScrollPersistence() {
  const { pathname } = useLocation();
  const isInitialLoad = useRef(savedScrollTop === null);

  // Track scroll position continuously
  useEffect(() => {
    const el = findScrollableElement();
    if (!el) return;

    const handler = () => {
      savedScrollTop = el.scrollTop;
    };

    el.addEventListener("scroll", handler, { passive: true });

    return () => el.removeEventListener("scroll", handler);
  }, []);

  // On navigation: restore saved position, or center active item on first load
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on pathname change to restore scroll
  useEffect(() => {
    const el = findScrollableElement();
    if (!el) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;

      // Center active item after DOM settles
      const timeout = setTimeout(() => {
        const activeItem = el.querySelector("[data-active='true']");
        if (!activeItem) return;

        const scrollRect = el.getBoundingClientRect();
        const activeRect = activeItem.getBoundingClientRect();
        const relativeTop = activeRect.top - scrollRect.top + el.scrollTop;

        el.scrollTop = Math.max(
          0,
          relativeTop - scrollRect.height / 2 + activeRect.height / 2,
        );
      }, 100);

      return () => clearTimeout(timeout);
    }

    // Restore scroll position after navigation. Apply at multiple points
    // to counteract any intermediate resets from re-renders or framework effects.
    const pos = savedScrollTop ?? 0;

    el.scrollTop = pos;

    const raf = requestAnimationFrame(() => {
      el.scrollTop = pos;
    });

    const timeout = setTimeout(() => {
      el.scrollTop = pos;
    }, 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [pathname]);
}
