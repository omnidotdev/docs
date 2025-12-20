import { createFileRoute, notFound, useLocation } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import {
  SidebarFolderContent as BaseSidebarFolderContent,
  SidebarFolderLink as BaseSidebarFolderLink,
  SidebarFolderTrigger as BaseSidebarFolderTrigger,
  SidebarFolder,
  useFolder,
  useFolderDepth,
} from "fumadocs-ui/components/sidebar/base";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { cn } from "fumadocs-ui/utils/cn";

import browserCollections from "fumadocs-mdx:collections/browser";
import { RotatingBanner } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { app } from "@/lib/config";
import baseLayoutOptions from "@/lib/layout.base";
import source from "@/lib/source";
import capitalizeFirstLetter from "@/lib/util/capitalizeFirstLetter";
import seo from "@/lib/util/seo";

import type * as PageTree from "fumadocs-core/page-tree";
import type { ComponentProps, ReactNode } from "react";

// styled sidebar folder components (`replicating fumadocs-ui/layouts/docs/sidebar` styling)
const itemVariants =
    "relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0",
  buttonVariant =
    "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none",
  linkVariant =
    "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors";

const getItemOffset = (depth: number) =>
  `calc(${2 + 3 * depth} * var(--spacing))`;

const SidebarFolderTrigger = ({
  className,
  style,
  ...props
}: ComponentProps<typeof BaseSidebarFolderTrigger>) => {
  const folder = useFolder();
  const depth = folder?.depth ?? 1;
  const collapsible = folder?.collapsible ?? true;

  return (
    <BaseSidebarFolderTrigger
      className={cn(
        itemVariants,
        collapsible && buttonVariant,
        "w-full",
        className,
      )}
      style={{
        paddingInlineStart: getItemOffset(depth - 1),
        ...style,
      }}
      {...props}
    />
  );
};

const SidebarFolderLink = ({
  className,
  style,
  ...props
}: ComponentProps<typeof BaseSidebarFolderLink>) => {
  const depth = useFolderDepth();
  return (
    <BaseSidebarFolderLink
      className={cn(itemVariants, linkVariant, "w-full", className)}
      style={{
        paddingInlineStart: getItemOffset(depth - 1),
        ...style,
      }}
      {...props}
    />
  );
};

const SidebarFolderContent = ({
  className,
  ...props
}: ComponentProps<typeof BaseSidebarFolderContent>) => {
  const depth = useFolderDepth();

  return (
    <BaseSidebarFolderContent
      className={cn(
        "relative",
        depth === 1 &&
          "before:absolute before:inset-y-1 before:start-2.5 before:w-px before:bg-fd-border before:content-['']",
        className,
      )}
      {...props}
    />
  );
};

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
const NEW_PRODUCTS = ["RDK"],
  COMING_SOON_PRODUCTS = ["Runa", "Thornberry"];

// TODO fix alphabetical sort (folders appearing last)

/**
 * Splat page.
 */
const Page = () => {
  const { data } = Route.useLoaderData();
  const { pageTree } = useFumadocsLoader(data);
  const patchedTree = transformPageTree(pageTree);

  const Content = clientLoader.getComponent(data.path);

  const { pathname } = useLocation();

  return (
    <>
      <RotatingBanner />

      <DocsLayout
        {...baseLayoutOptions()}
        tree={patchedTree}
        sidebar={{
          banner: (
            <span className="text-xs">
              We turn ideas into products, from apps to websites to email
              automation.
              <a
                href="https://omni.dev/#contact"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2 cursor-pointer px-0 text-fd-primary text-xs"
                >
                  Hire Us →
                </Button>
              </a>
            </span>
          ),
          footer: (
            <div className="mt-3 flex justify-end gap-2 text-2xs text-fd-accent-foreground/80">
              <a
                href={app.legal.privacyPolicy}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>

              <a
                href={app.legal.termsOfService}
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
            </div>
          ),
          components: {
            Separator: ({ item }) => (
              // TODO collapsible
              <>
                <hr className="my-6" />

                <div className="mb-2 inline-flex items-center gap-2 font-bold [&amp;_svg]:size-4 [&amp;_svg]:shrink-0">
                  <p>
                    <span className="flex gap-2 ps-[calc(2*var(--spacing))]">
                      {item.icon}
                      {item.name}

                      {/* TODO pillar description */}
                    </span>
                  </p>
                </div>
              </>
            ),
            Folder: ({
              item,
              children,
            }: {
              item: PageTree.Folder;
              children: ReactNode;
            }) => {
              const getFolderBadge = () => {
                // Check folder name for product matches
                const nameHtml =
                  // @ts-expect-error TODO type `props` properly
                  item.name?.props?.dangerouslySetInnerHTML?.__html;

                if (
                  NEW_PRODUCTS.some((product) => nameHtml?.includes(product))
                ) {
                  return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      New! 🚀
                    </Badge>
                  );
                }

                if (
                  COMING_SOON_PRODUCTS.some((product) =>
                    nameHtml?.includes(product),
                  )
                ) {
                  return (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                      Coming Soon 🚧
                    </Badge>
                  );
                }

                return null;
              };

              const badge = getFolderBadge();

              return (
                <SidebarFolder
                  collapsible={item.collapsible}
                  defaultOpen={item.defaultOpen}
                >
                  {item.index ? (
                    <SidebarFolderLink href={item.index.url}>
                      {item.icon}
                      {item.name}
                      {badge && <span className="ml-auto">{badge}</span>}
                    </SidebarFolderLink>
                  ) : (
                    <SidebarFolderTrigger>
                      {item.icon}
                      {item.name}
                      {badge && <span className="mr-auto">{badge}</span>}
                    </SidebarFolderTrigger>
                  )}
                  <SidebarFolderContent>{children}</SidebarFolderContent>
                </SidebarFolder>
              );
            },
            Item: ({ item }) => (
              <a
                data-active={item.url === pathname}
                data-status={item.url === pathname && "active"}
                aria-current="page"
                href={item.url}
                className="wrap-anywhere active relative flex flex-row items-center justify-between gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors [&amp;_svg]:size-4 [&amp;_svg]:shrink-0"
              >
                <span
                  className={`flex items-center gap-2 ${
                    // visually nest if child of folder
                    // @ts-expect-error TODO
                    item.isChildOfFolder ? "ps-[calc(2*var(--spacing))]" : ""
                  }`}
                >
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
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    New! 🚀
                  </Badge>
                )}

                {COMING_SOON_PRODUCTS.some((product) =>
                  // @ts-expect-error TODO type `props` properly
                  item.name?.props?.dangerouslySetInnerHTML?.__html?.includes(
                    product,
                  ),
                ) && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
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

    return { data, slugs };
  },
  head: ({ loaderData }) => {
    const slugs = loaderData?.slugs;

    const currentSegment = slugs?.length
      ? slugs
          .at(-1)
          ?.split("-")
          .map((seg) =>
            // TODO make this more robust (avoid hardcoding product acronyms here)
            capitalizeFirstLetter({ str: seg, allCaps: seg === "rdk" }),
          )
          .join(" ")
      : undefined;

    return {
      // TODO: dynamic descriptions
      meta: seo({ title: currentSegment ?? undefined }),
    };
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

const transformPageTree = (root: PageTree.Root): PageTree.Root => {
  // add lineage flag
  const mapNode = <T extends PageTree.Node>(
    item: T,
    isChildOfFolder = false,
  ): T => {
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
        // mark folder itself
        isChildOfFolder,
        index: item.index ? mapNode(item.index, true) : undefined,
        // mark all children of folder
        children: item.children.map((c) => mapNode(c, true)),
      };

    // leaf/file
    return {
      ...item,
      isChildOfFolder,
    };
  };

  return {
    ...root,
    // root children have no parent folder
    children: root.children.map((c) => mapNode(c, false)),
    fallback: root.fallback ? transformPageTree(root.fallback) : undefined,
  };
};
