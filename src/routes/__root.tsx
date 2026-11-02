import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { useEffect, useState } from "react";

import createMetaTags from "@/lib/util/seo";

// Import the global stylesheet as a side effect (not `?url` + a manual <link>).
// With `?url` the SSR build computed its own content hash for app.css, which in
// the production build environment diverged from the client's emitted hash, so
// the server-rendered <link> pointed at a file that 404s and the page flashed
// unstyled. Importing it lets Vite/TanStack inject the stylesheet from the
// client manifest, so the server and client always reference the same hash.
import "@/lib/styles/app.css";

import type { PropsWithChildren } from "react";

/**
 * Display `Ctrl` or `⌘` based on operating system.
 */
const CtrlOrCmd = () => {
  const [key, setKey] = useState("⌘");

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);

    if (!isMac) setKey("Ctrl");
  }, []);

  return key;
};

/**
 * Search hotkey configuration (Ctrl/⌘ + K).
 */
const searchHotKey = [
  {
    key: (evt: KeyboardEvent) => evt.metaKey || evt.ctrlKey,
    display: <CtrlOrCmd />,
  },
  {
    key: "k",
    display: "K",
  },
];

/**
 * Root component.
 */
const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
);

/**
 * Root route.
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...createMetaTags(),
    ],
    // TODO manifest (TSS template https://github.com/omnidotdev/template-tanstack-start/pull/7)
    links: [
      { rel: "icon", href: "/favicon.ico" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
  }),
  component: RootComponent,
});

/**
 * Root document.
 */
const RootDocument = ({ children }: PropsWithChildren) => (
  <html suppressHydrationWarning lang="en">
    <head>
      <HeadContent />
    </head>

    <body className="flex min-h-screen flex-col">
      <RootProvider search={{ hotKey: searchHotKey }}>{children}</RootProvider>

      {/* NB: dev tools automatically only included when `NODE_ENV=development` */}
      {import.meta.env.DEV && (
        <TanStackDevtools
          plugins={[
            {
              name: "Router",
              render: <TanStackRouterDevtoolsPanel />,
              defaultOpen: true,
            },
          ]}
        />
      )}

      <Scripts />
    </body>
  </html>
);
