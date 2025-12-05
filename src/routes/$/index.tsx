import browserCollections from "fumadocs-mdx:collections/browser";
import { createFileRoute, notFound, useLocation } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { Banner } from "fumadocs-ui/components/banner";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import defaultMdxComponents from "fumadocs-ui/mdx";

import baseLayoutOptions from "@/lib/layout.base";
import source from "@/lib/source";

import type * as PageTree from "fumadocs-core/page-tree";
import { Badge } from "@/components/ui/badge";

// TODO extract to frontmatter
// can be extended in source config e.g.
// ```
//  docs: {
//    schema: frontmatterSchema.extend({
//      new: z.boolean().default(false),
//    }),
//  },
// ````
// then need to figure a way to grab the frontmatter here

// TODO grab from Omni API
const NEW_PRODUCTS = ["Backfeed", "Garden"],
  COMING_SOON_PRODUCTS = ["Runa", "Thornberry"];

// TODO fix alphabetical sort (folders appearing last)
// TODO sidebar Omni logo

/**
 * Splat page.
 */
const Page = () => {
  const data = Route.useLoaderData();
  const { pageTree } = useFumadocsLoader(data);
  const Content = clientLoader.getComponent(data.path);

  const { pathname } = useLocation();

  return (
    <>
      <Banner variant="rainbow">
        Omni builds open source software for everyone
      </Banner>

      <DocsLayout
        {...baseLayoutOptions()}
        tree={pageTree}
        sidebar={{
          components: {
            Separator: ({ item }) => (
              // TODO collapsible
              <>
                <hr className="my-6" />

                <div className="mb-2 inline-flex items-center gap-2 font-bold [&amp;_svg]:size-4 [&amp;_svg]:shrink-0">
                  <p style={{ paddingInlineStart: "calc(2 * var(--spacing))" }}>
                    <span className="flex gap-2">
                      {item.icon}
                      {item.name}
                    </span>
                  </p>
                </div>
              </>
            ),
            // TODO do similar to `Item` below (badges)
            // unsure of a clean way to do this, the styles below for `Item` were grabbed from the default Fumadocs sidebar item rendered DOM
            // Folder: (folder) => <></>,
            Item: ({ item }) => (
              <a
                data-active={item.url === pathname}
                data-status={item.url === pathname && "active"}
                aria-current="page"
                href={item.url}
                style={{ paddingInlineStart: "calc(2 * var(--spacing))" }}
                className="wrap-anywhere active relative flex flex-row items-center justify-between gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors [&amp;_svg]:size-4 [&amp;_svg]:shrink-0"
              >
                <span className="flex gap-2">
                  {item.icon}
                  {item.name}
                </span>

                {/* TODO convert to frontmatter (see note near top of file) */}
                {NEW_PRODUCTS.some((product) =>
                  // @ts-expect-error TODO type `props` properly
                  item.name?.props?.dangerouslySetInnerHTML?.__html?.includes(
                    product,
                  ),
                ) && (
                  <Badge className="bg-green-200 text-green-950">New! 🚀</Badge>
                )}

                {COMING_SOON_PRODUCTS.some((product) =>
                  // @ts-expect-error TODO type `props` properly
                  item.name?.props?.dangerouslySetInnerHTML?.__html?.includes(
                    product,
                  ),
                ) && (
                  <Badge className="bg-amber-200 text-amber-950">
                    Coming Soon 🚧
                  </Badge>
                )}
              </a>
            ),
          },
        }}
      >
        <Content />
      </DocsLayout>
    </>
  );
};

/**
 * Splat route.
 */
export const Route = createFileRoute("/$/")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];

    const data = await serverLoader({ data: slugs });

    await clientLoader.preload(data.path);

    return data;
  },
});

const serverLoader = createServerFn({ method: "GET" })
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);

    if (!page) throw notFound();

    return {
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component: ({ toc, frontmatter, default: MDX }) => (
    <DocsPage toc={toc}>
      <DocsTitle>{frontmatter.title}</DocsTitle>
      <DocsDescription>{frontmatter.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
          }}
        />
      </DocsBody>
    </DocsPage>
  ),
});

// biome-ignore lint/correctness/noUnusedVariables: false alarm
const transformPageTree = (root: PageTree.Root): PageTree.Root => {
  const mapNode = <T extends PageTree.Node>(item: T): T => {
    if (typeof item.icon === "string")
      item = {
        ...item,
        icon: (
          <span
            // biome-ignore lint/security/noDangerouslySetInnerHtml: pattern implemented from Fumadocs
            dangerouslySetInnerHTML={{
              __html: item.icon,
            }}
          />
        ),
      };

    if (item.type === "folder")
      return {
        ...item,
        index: item.index ? mapNode(item.index) : undefined,
        children: item.children.map(mapNode),
      };

    return item;
  };

  return {
    ...root,
    children: root.children.map(mapNode),
    fallback: root.fallback ? transformPageTree(root.fallback) : undefined,
  };
};
