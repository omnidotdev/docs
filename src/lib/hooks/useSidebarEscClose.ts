import { useEffect } from "react";

/**
 * Close the mobile sidebar drawer when ESC key is pressed.
 */
export function useSidebarEscClose() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Find and click the overlay to close the sidebar drawer
        const overlay = document.querySelector(
          "[data-state='open'][class*='backdrop']",
        ) as HTMLElement | null;
        if (overlay) {
          overlay.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
