import { createFileRoute, notFound, useLocation } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { useEffect, useState } from "react";

import browserCollections from "fumadocs-mdx:collections/browser";
import {
  SidebarFolder,
  SidebarItem,
  SidebarSection,
  SidebarSeparator,
} from "@/components/docs";
import { RotatingBanner } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { app } from "@/lib/config";
import baseLayoutOptions from "@/lib/layout.base";
import transformPageTree from "@/lib/pageTreeTransform";
import { getPillarByPath } from "@/lib/pillars";
import source from "@/lib/source";
import capitalizeFirstLetter from "@/lib/util/capitalizeFirstLetter";
import seo from "@/lib/util/seo";

/**
 * Determine which section contains the current page.
 * @param pathname Current pathname.
 * @returns Section name, if found.
 */
const getSectionFromPath = (pathname: string): string => {
  const pillar = getPillarByPath(pathname);
  return pillar?.id ?? "welcome";
};

/**
 * Splat page.
 */
const Page = () => {
  const { data, activeSection } = Route.useLoaderData();
  const { pageTree } = useFumadocsLoader(data);
  const patchedTree = transformPageTree(pageTree);

  const Content = clientLoader.getComponent(data.path);

  const { pathname } = useLocation();

  const [currentOpenSection, setCurrentOpenSection] = useState<string | null>(
    () => activeSection || getSectionFromPath(pathname) || "welcome",
  );

  // update open section when pathname changes
  useEffect(() => {
    const newActiveSection = getSectionFromPath(pathname);

    setCurrentOpenSection(newActiveSection);
  }, [pathname]);

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
            Separator: ({ item }) => <SidebarSeparator item={item} />,
            Folder: ({ item, children }) => {
              // check if this is a virtual section folder created by the transform
              if ((item as any).virtualSection) {
                const originalSeparator = (item as any).originalSeparator;
                const sectionId = (item as any).sectionId;
                const isOpen = currentOpenSection === sectionId;

                const handleToggle = (newOpen: boolean) => {
                  setCurrentOpenSection(newOpen ? sectionId : null);
                };

                return (
                  <SidebarSection
                    item={item}
                    sectionId={sectionId}
                    isOpen={isOpen}
                    onToggle={handleToggle}
                    originalSeparator={originalSeparator}
                  >
                    {children}
                  </SidebarSection>
                );
              }

              // regular folder behavior (these don't participate in accordion behavior)
              return <SidebarFolder item={item}>{children}</SidebarFolder>;
            },
            Item: ({ item }) => <SidebarItem item={item} pathname={pathname} />,
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
  loader: async ({ params, location }) => {
    const slugs = params._splat?.split("/") ?? [];

    const data = await serverLoader({ data: slugs });

    await clientLoader.preload(data.path);

    // determine active section
    const pathname = new URL(location.url).pathname;
    const activeSection = getSectionFromPath(pathname);

    return { data, slugs, activeSection };
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
      // TODO dynamic descriptions
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
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  ),
});
