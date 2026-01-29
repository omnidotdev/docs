import app from "@/lib/config/app.config";
import stripEmojis from "@/lib/util/stripEmojis";

interface Params {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  url?: string;
  /** Page slug for dynamic OG image generation. */
  slug?: string;
}

/**
 * Generate dynamic OG image URL from slug.
 */
const getOgImageUrl = (slug?: string): string => {
  // Use "index" for homepage, otherwise use the slug
  const path = slug || "index";

  return `${app.appUrl}/og/${path}.png`;
};

/**
 * Create meta tags.
 */
const createMetaTags = ({
  title,
  description,
  image,
  keywords,
  url,
  slug,
}: Params = {}) => {
  const cleanTitle = title ? stripEmojis(title) : null;
  // Page title includes app name suffix, OG title does not
  const pageTitle = cleanTitle
    ? `${cleanTitle} | ${app.name.long}`
    : app.name.long;
  const ogTitle = cleanTitle ?? app.name.long;
  const displayedDescription = description ?? app.description;
  const displayedUrl = url ?? app.appUrl;
  const ogImage = image ?? getOgImageUrl(slug);

  const tags = [
    { title: pageTitle },
    {
      name: "description",
      content: displayedDescription,
    },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: ogTitle },
    {
      name: "twitter:description",
      content: displayedDescription,
    },
    { name: "twitter:creator", content: "@omnidotdev" },
    { name: "twitter:url", content: displayedUrl },
    { property: "og:type", content: "website" },
    { property: "og:title", content: ogTitle },
    {
      property: "og:description",
      content: displayedDescription,
    },
    { property: "og:url", content: displayedUrl },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
  ];

  return tags;
};

export default createMetaTags;
