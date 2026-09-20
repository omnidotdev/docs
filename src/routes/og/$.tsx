import { Resvg } from "@resvg/resvg-js";
import { createFileRoute } from "@tanstack/react-router";
import satori from "satori";

import OgImage from "@/components/og/OgImage";
import { products } from "@/lib/catalog/generated/catalog";
import { PRODUCT_REALMS } from "@/lib/productRealms.generated";
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

/** Display name for a product id, from the public catalog. */
const getProductName = (id: string): string | undefined => {
  return products.find((product) => product.id === id)?.name;
};

interface OgMetadata {
  realm: Realm | null;
  title: string;
  description: string;
  /** Footer product label, when the page belongs to a product. */
  productName?: string;
}

/**
 * Resolve the realm (and product, if any) a docs path belongs to.
 *
 * After the URL restructure, product pages live at /products/<id>/... and realm
 * hubs at /realms/<realm>, so the realm can no longer be read from the first
 * path segment. Product pages resolve their realm through the generated public
 * product -> realm map.
 */
const resolveRealmAndProduct = (
  segments: string[],
): { realm: Realm | null; productName?: string } => {
  if (segments[0] === "products" && segments[1]) {
    const id = segments[1];
    const realmId = PRODUCT_REALMS[id];

    return {
      realm: (realmId ? getRealmById(realmId) : undefined) ?? null,
      productName: getProductName(id) ?? formatSlugToTitle(id),
    };
  }

  if (segments[0] === "realms" && segments[1]) {
    return { realm: getRealmById(segments[1]) ?? null };
  }

  return { realm: null };
};

/** Resolve OG metadata from a path. */
const getOgMetadata = (path: string): OgMetadata => {
  // "products/fractal/object-storage.png" → ["products", "fractal", ...]
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

  const { realm, productName } = resolveRealmAndProduct(segments);
  const page = source.getPage(segments);

  return {
    realm,
    productName,
    title: page?.data.title ?? formatSlugToTitle(segments.at(-1) ?? ""),
    description:
      page?.data.description ?? realm?.tagline ?? "Omni Documentation",
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

        const { realm, title, description, productName } = getOgMetadata(path);

        try {
          const fontData = await fetchFont();
          const cleanTitle = stripEmojis(title);

          const svg = await satori(
            <OgImage
              title={cleanTitle}
              description={description}
              realm={realm}
              label={productName ? stripEmojis(productName) : undefined}
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
            // Satori already vectorizes all text to paths, so resvg never needs
            // a font. Skipping the system-font scan cuts each render from ~10s
            // (resvg building a full OS font database) to ~30ms.
            font: { loadSystemFonts: false },
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
