import { Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";

import baseLayoutOptions from "@/lib/layout.base";

/**
 * 404 not found.
 */
const NotFound = () => (
  <HomeLayout {...baseLayoutOptions()} className="text-center">
    <div className="mt-18 flex flex-col items-center gap-4">
      <h1 className="font-bold text-6xl text-fd-muted-foreground">404</h1>

      <h2 className="font-semibold text-2xl">Page Not Found</h2>

      <p className="max-w-md text-fd-muted-foreground">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>

      <Link
        to="/$"
        className="mt-4 rounded-lg bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground text-sm transition-opacity hover:opacity-90"
      >
        Return Home
      </Link>
    </div>
  </HomeLayout>
);

export default NotFound;
