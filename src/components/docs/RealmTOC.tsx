import Link from "fumadocs-core/link";
import { useEffect, useState } from "react";

import getRealmPages from "@/server/functions/pages";

interface RealmPage {
  url: string;
  title: string;
  description?: string;
}

interface Props {
  /** The realm path (e.g. "core", "fabric"). */
  realmPath: string;
}

/**
 * Auto-generated Table of Contents for realm intro pages.
 * Displays all child pages within the realm.
 */
const RealmTOC = ({ realmPath }: Props) => {
  const [pages, setPages] = useState<RealmPage[]>([]);

  useEffect(() => {
    getRealmPages({ data: realmPath }).then(setPages).catch(console.error);
  }, [realmPath]);

  if (pages.length === 0) return null;

  // sort pages alphabetically by title (strip emojis for sorting)
  const sortedPages = [...pages].sort((a, b) => {
    const stripEmoji = (str: string) =>
      str
        .replace(
          /[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
          "",
        )
        .replace(/\uFE0F/g, "")
        .trim();

    return stripEmoji(a.title)
      .toLowerCase()
      .localeCompare(stripEmoji(b.title).toLowerCase());
  });

  return (
    <div className="mt-8">
      <h2>Realm Table of Contents</h2>

      <ul className="not-prose grid auto-rows-fr gap-2 sm:grid-cols-2">
        {sortedPages.map((page) => (
          <li key={page.url}>
            <Link
              href={page.url}
              className="flex h-full flex-col rounded-lg border border-fd-border bg-fd-card p-3 transition-colors hover:border-fd-primary/50 hover:bg-fd-accent"
            >
              <span className="font-medium text-fd-foreground text-sm">
                {page.title}
              </span>

              <p className="mt-1 line-clamp-2 flex-1 text-fd-muted-foreground text-xs">
                {page.description || "\u00A0"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RealmTOC;
