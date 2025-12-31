import { createServerFn } from "@tanstack/react-start";

import source from "@/lib/source";

/**
 * Get pages for a specific realm.
 */
const getRealmPages = createServerFn({ method: "GET" })
  .inputValidator((realmPath: string) => realmPath)
  .handler(async ({ data: realmPath }) => {
    const pages = source.getPages();

    const realmPages = pages
      .filter(
        (page) =>
          page.slugs[0] === realmPath &&
          page.slugs.length === 2 &&
          page.slugs[1] !== "index",
      )
      .sort((a, b) => {
        const stripEmoji = (str: string) =>
          str
            .replace(
              /[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
              "",
            )
            .replace(/\uFE0F/g, "")
            .trim();
        const titleA = stripEmoji(a.data.title ?? "").toLowerCase();
        const titleB = stripEmoji(b.data.title ?? "").toLowerCase();
        return titleA.localeCompare(titleB);
      })
      .map((page) => ({
        url: page.url,
        title: page.data.title ?? "",
        description: page.data.description,
      }));

    return realmPages;
  });

export default getRealmPages;
