import { useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";

interface ScrollState {
  scrollTop: number;
  timestamp: number;
}

const STORAGE_KEY = "sidebar-scroll-state";
const SCROLL_DEBOUNCE_MS = 100;

// Find the sidebar's scrollable element
const findScrollableElement = (): Element | null => {
  const selectors = [
    "aside [data-radix-scroll-area-viewport]",
    "aside .fd-sidebar-viewport",
    'aside > div > div[style*="overflow"]',
    "aside > div > div:first-child",
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.scrollHeight > element.clientHeight) {
      return element;
    }
  }

  // Fallback: find any scrollable element in aside
  const aside = document.querySelector("aside");

  if (aside) {
    const scrollableElements = aside.querySelectorAll("*");
    for (const el of scrollableElements) {
      const styles = window.getComputedStyle(el);
      if (
        (styles.overflowY === "auto" || styles.overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight
      ) {
        return el;
      }
    }
  }

  return null;
};

export function useSidebarScrollPersistence() {
  const router = useRouter();
  const scrollElementRef = useRef<Element | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringRef = useRef(false);

  // Save scroll position to sessionStorage
  const saveScrollPosition = useCallback(() => {
    if (isRestoringRef.current || !scrollElementRef.current) return;

    const scrollState: ScrollState = {
      scrollTop: scrollElementRef.current.scrollTop,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scrollState));
    } catch (error) {
      console.warn("Failed to save sidebar scroll position:", error);
    }
  }, []);

  // Restore scroll position from sessionStorage
  const restoreScrollPosition = useCallback(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (!savedData) return false;

      const scrollState: ScrollState = JSON.parse(savedData);

      // Don't restore if data is too old (more than 1 hour)
      if (Date.now() - scrollState.timestamp > 60 * 60 * 1000) {
        sessionStorage.removeItem(STORAGE_KEY);
        return false;
      }

      const scrollElement = findScrollableElement();
      if (!scrollElement) return false;

      isRestoringRef.current = true;

      // Disable smooth scrolling during restoration
      const originalScrollBehavior = (scrollElement as HTMLElement).style
        ?.scrollBehavior;
      if (scrollElement instanceof HTMLElement) {
        scrollElement.style.scrollBehavior = "auto";
      }

      scrollElement.scrollTop = scrollState.scrollTop;
      scrollElementRef.current = scrollElement;

      // Re-enable smooth scrolling after a brief delay
      setTimeout(() => {
        if (scrollElement instanceof HTMLElement) {
          scrollElement.style.scrollBehavior = originalScrollBehavior || "";
        }
        isRestoringRef.current = false;
      }, 50);

      return true;
    } catch (error) {
      console.warn("Failed to restore sidebar scroll position:", error);
      sessionStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }, []);

  // Set up scroll event listener
  const setupScrollListener = useCallback(() => {
    const scrollElement = findScrollableElement();
    if (!scrollElement) return null;

    scrollElementRef.current = scrollElement;

    const handleScroll = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(
        saveScrollPosition,
        SCROLL_DEBOUNCE_MS,
      );
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveScrollPosition]);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    // Initial setup with multiple attempts to handle async DOM updates
    const initializeWithRetries = () => {
      let attempts = 0;
      const maxAttempts = 5;

      const trySetup = () => {
        cleanup?.(); // Clean up previous attempt
        cleanup = setupScrollListener();

        if (cleanup) {
          // Successfully found element, try to restore scroll
          setTimeout(() => restoreScrollPosition(), 10);
          setTimeout(() => restoreScrollPosition(), 50);
          setTimeout(() => restoreScrollPosition(), 150);
        } else if (attempts < maxAttempts) {
          // Element not found yet, try again
          attempts++;
          setTimeout(trySetup, 100 * attempts);
        }
      };

      trySetup();
    };

    initializeWithRetries();

    // Watch for DOM mutations in case sidebar is rendered dynamically
    const observer = new MutationObserver(() => {
      if (
        !scrollElementRef.current ||
        !document.contains(scrollElementRef.current)
      ) {
        initializeWithRetries();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Save scroll position before navigation
    const handleBeforeNavigate = () => {
      saveScrollPosition();
    };

    // Listen for TanStack router navigation events
    const unsubscribe = router.subscribe(
      "onBeforeNavigate",
      handleBeforeNavigate,
    );

    return () => {
      cleanup?.();
      observer.disconnect();
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [router, restoreScrollPosition, saveScrollPosition, setupScrollListener]);

  // Provide manual save/restore functions for advanced usage
  return {
    saveScrollPosition,
    restoreScrollPosition,
  };
}
