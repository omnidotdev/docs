import { LEGACY_REDIRECTS } from "@/lib/redirects.generated";

/**
 * Resolve a legacy documentation URL to its canonical target.
 * @param pathname Incoming request pathname.
 * @returns Canonical target path, or `null` when the pathname is not a legacy URL.
 */
export const resolveRedirect = (pathname: string): string | null => {
  // strip a single trailing slash, but preserve the root path
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  return LEGACY_REDIRECTS[normalized] ?? null;
};
