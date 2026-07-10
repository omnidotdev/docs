import { Link, useRouter } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { useEffect } from "react";

import baseLayoutOptions from "@/lib/layout.base";

import type { ErrorComponentProps } from "@tanstack/react-router";

/** Session flag guarding against reload loops when recovery fails. */
const RELOAD_GUARD_KEY = "docs:chunk-reload";

/**
 * Detect a failed dynamic module import, which happens when a client holding a
 * stale build requests a hashed chunk that a newer deploy has replaced. A full
 * reload fetches fresh HTML referencing the current chunk hashes.
 */
const isChunkLoadError = (error: Error): boolean => {
  const message = `${error?.name ?? ""} ${error?.message ?? ""}`;

  return /dynamically imported module|Importing a module script failed|ChunkLoadError|Failed to fetch/i.test(
    message,
  );
};

/**
 * Default route error boundary. Transient navigation failures (most commonly a
 * stale chunk after a deploy) self-recover via a single reload; anything else
 * shows a friendly, actionable message with manual retry.
 */
const ErrorComponent = ({ error, reset }: ErrorComponentProps) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !isChunkLoadError(error)) return;

    // reload once; if the fresh build still errors, fall through to the UI
    if (sessionStorage.getItem(RELOAD_GUARD_KEY)) {
      sessionStorage.removeItem(RELOAD_GUARD_KEY);

      return;
    }

    sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
    window.location.reload();
  }, [error]);

  const handleRetry = () => {
    reset();
    router.invalidate();
  };

  return (
    <HomeLayout {...baseLayoutOptions()} className="text-center">
      <div className="mt-18 flex flex-col items-center gap-4">
        <h2 className="font-semibold text-2xl">Something went wrong</h2>

        <p className="max-w-md text-fd-muted-foreground">
          This page could not be loaded. This is usually temporary, please try
          again in a moment.
        </p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="cursor-pointer rounded-lg bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground text-sm transition-opacity hover:opacity-90"
          >
            Try Again
          </button>

          <Link
            to="/$"
            className="rounded-lg border px-4 py-2 font-medium text-fd-muted-foreground text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            Return Home
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
};

export default ErrorComponent;
