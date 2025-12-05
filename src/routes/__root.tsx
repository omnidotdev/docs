import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { RootProvider } from "fumadocs-ui/provider/tanstack";

import { app } from "@/lib/config";
import appCss from "@/lib/styles/app.css?url";

import type { PropsWithChildren } from "react";

/**
 * Root component.
 */
const RootComponent = () => (
  <RootDocument>
    <Outlet />

    <TanStackRouterDevtools />
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
      {
        title: app.name.long,
      },
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
      <RootProvider>{children}</RootProvider>

      <Scripts />
    </body>
  </html>
);
