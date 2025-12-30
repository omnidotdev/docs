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

import appCss from "@/lib/styles/app.css?url";
import createMetaTags from "@/lib/util/seo";

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
    key: (e: KeyboardEvent) => e.metaKey || e.ctrlKey,
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
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
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
      <TanStackDevtools
        plugins={[
          {
            name: "Router",
            render: <TanStackRouterDevtoolsPanel />,
            defaultOpen: true,
          },
        ]}
      />

      <Scripts />
    </body>
  </html>
);
