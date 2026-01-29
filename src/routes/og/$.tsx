import { Resvg } from "@resvg/resvg-js";
import { createFileRoute } from "@tanstack/react-router";
import satori from "satori";

import OgImage from "@/components/og/OgImage";
import source from "@/lib/source";
import capitalizeFirstLetter from "@/lib/util/capitalizeFirstLetter";
import stripEmojis from "@/lib/util/stripEmojis";
import realmsData from "../../../realms.json";

type Realm = (typeof realmsData.realms)[number];

/** Roboto font URL. */
const ROBOTO_URL =
  "https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Regular.ttf";

/** Cached font data. */
let fontCache: ArrayBuffer | null = null;

/** Fetch Roboto font for Satori (cached). */
const fetchFont = async (): Promise<ArrayBuffer> => {
  if (fontCache) return fontCache;

  const data = await fetch(ROBOTO_URL).then((r) => r.arrayBuffer());
  fontCache = data;

  return data;
};

// TODO: Add emoji support once Satori supports COLR font format.

/** Format a slug segment into a readable title. */
const formatSlugToTitle = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => capitalizeFirstLetter({ str: word }))
    .join(" ");
};

/** Get realm by ID. */
const getRealmById = (id: string): Realm | undefined => {
  return realmsData.realms.find((r) => r.id === id);
};

interface OgMetadata {
  realm: Realm | null;
  title: string;
  description: string;
}

/** Resolve OG metadata from a path. */
const getOgMetadata = (path: string): OgMetadata => {
  // "core/crystal.png" → ["core", "crystal"]
  const cleaned = path.replace(/\.png$/, "");
  const segments = cleaned.split("/").filter(Boolean);

  // Handle homepage (empty path or "index")
  if (
    segments.length === 0 ||
    (segments.length === 1 && segments[0] === "index")
  ) {
    return {
      realm: null,
      title: "Omni Docs",
      description: "Documentation for the Omni ecosystem",
    };
  }

  const realmId = segments[0];
  const realm = getRealmById(realmId) ?? null;

  // Try to get page from source
  const page = source.getPage(segments);

  if (page) {
    return {
      realm,
      title: page.data.title ?? formatSlugToTitle(segments.at(-1) ?? ""),
      description:
        page.data.description ?? realm?.tagline ?? "Omni Documentation",
    };
  }

  // Fallback: format the last segment as title
  const lastSegment = segments.at(-1) ?? "";

  return {
    realm,
    title: formatSlugToTitle(lastSegment),
    description: realm?.tagline ?? "Omni Documentation",
  };
};

/**
 * OG image route handler.
 * Generates dynamic PNG images for OpenGraph previews.
 */
export const Route = createFileRoute("/og/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";

        // Validate path ends with .png
        if (!path.endsWith(".png")) {
          return new Response("Not found", { status: 404 });
        }

        const { realm, title, description } = getOgMetadata(path);

        try {
          const fontData = await fetchFont();
          const cleanTitle = stripEmojis(title);

          const svg = await satori(
            <OgImage
              title={cleanTitle}
              description={description}
              realm={realm}
            />,
            {
              width: 1200,
              height: 630,
              fonts: [
                {
                  name: "Roboto",
                  data: fontData,
                  weight: 400,
                  style: "normal",
                },
              ],
            },
          );

          const resvg = new Resvg(svg, {
            fitTo: {
              mode: "width",
              value: 1200,
            },
          });

          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();

          return new Response(new Uint8Array(pngBuffer), {
            headers: {
              "Content-Type": "image/png",
              // Cache for 1 day, allow revalidation (avoid immutable for OG images)
              "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
          });
        } catch (error) {
          console.error("Error generating OG image for path:", path);
          console.error("Title:", title);
          console.error("Error:", error);

          return new Response("Error generating image", { status: 500 });
        }
      },
    },
  },
});
