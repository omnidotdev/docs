import browserCollections from "fumadocs-mdx:collections/browser";
import { createFileRoute, notFound } from "@tanstack/react-router";
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

const Page = () => {
  const data = Route.useLoaderData();
  const { pageTree } = useFumadocsLoader(data);
  const Content = clientLoader.getComponent(data.path);

  return (
    <>
      <Banner variant="rainbow">
        Omni builds open source software for creators, businesses
      </Banner>
      <DocsLayout {...baseLayoutOptions()} tree={pageTree}>
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
