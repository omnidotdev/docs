import { useLocation } from "@tanstack/react-router";
import { useSidebar } from "fumadocs-ui/components/sidebar/base";
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

// Delay covering the 200ms section and folder expand animations, so the
// active item has its final position before it is revealed
const EXPAND_SETTLE_MS = 250;

/**
 * Scroll the sidebar's own viewport (never the window) so its active item is
 * visible. `center` centers the item, `nearest` scrolls only when the item is
 * out of view and then by the smallest amount.
 * @param el Sidebar scroll viewport.
 * @param block Alignment of the active item.
 */
const revealActiveItem = (el: Element, block: "center" | "nearest") => {
  const activeItem = el.querySelector("[data-active='true']");
  if (!activeItem) return;

  const scrollRect = el.getBoundingClientRect();

  // the sidebar is hidden (desktop sidebar at mobile widths)
  if (scrollRect.height === 0) return;

  const activeRect = activeItem.getBoundingClientRect();
  const top = activeRect.top - scrollRect.top;
  const bottom = activeRect.bottom - scrollRect.top;

  if (block === "center") {
    el.scrollTop = Math.max(
      0,
      el.scrollTop + top - scrollRect.height / 2 + activeRect.height / 2,
    );

    return;
  }

  if (top < 0) el.scrollTop += top;
  else if (bottom > scrollRect.height)
    el.scrollTop += bottom - scrollRect.height;
};

// Module-level scroll position survives component re-mounts
let savedScrollTop: number | null = null;

/**
 * Hook to preserve sidebar scroll position across navigations, center the
 * active item on initial load, and keep it visible after client navigation.
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

  // On navigation: restore saved position then reveal the active item, or
  // center the active item on first load
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on pathname change to restore scroll
  useEffect(() => {
    const el = findScrollableElement();
    if (!el) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;

      // Center active item after DOM settles
      const timeout = setTimeout(() => revealActiveItem(el, "center"), 100);

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

    // Bring the new active item into view once any section or folder it lives
    // in has expanded, without moving the list if it is already visible
    const revealTimeout = setTimeout(
      () => revealActiveItem(el, "nearest"),
      EXPAND_SETTLE_MS,
    );

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      clearTimeout(revealTimeout);
    };
  }, [pathname]);
}

// Scroll viewport of the mobile drawer, which fumadocs mounts only while open
const DRAWER_VIEWPORT_SELECTOR =
  "#nd-sidebar-mobile [data-radix-scroll-area-viewport]";

/**
 * Center the active item in the mobile sidebar drawer each time it opens. The
 * drawer mounts fresh on open, scrolled to the top, so a deep active page would
 * otherwise sit below the fold. Scrolls only the drawer's own viewport, never
 * the window. Must be called inside `DocsLayout` (it reads the sidebar context).
 */
export function useDrawerActiveItemReveal() {
  const { open, mode } = useSidebar();

  useEffect(() => {
    if (!open || mode !== "drawer") return;

    const reveal = () => {
      const el = document.querySelector(DRAWER_VIEWPORT_SELECTOR);
      if (el) revealActiveItem(el, "center");
    };

    // Once the drawer has mounted and laid out, then again after any section or
    // folder holding the active item has finished expanding
    const raf = requestAnimationFrame(reveal);
    const timeout = setTimeout(reveal, EXPAND_SETTLE_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [open, mode]);
}
