import app from "@/lib/config/app.config";

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
  if (!slug) return `${app.appUrl}/img/omni-logo.png`;

  return `${app.appUrl}/og/${slug}.png`;
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
  const displayedTitle = title ? `${app.name.long} | ${title}` : app.name.long;
  const displayedDescription = description ?? app.description;
  const displayedUrl = url ?? app.appUrl;
  const ogImage = image ?? getOgImageUrl(slug);

  const tags = [
    { title: displayedTitle },
    {
      name: "description",
      content: displayedDescription,
    },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: displayedTitle },
    {
      name: "twitter:description",
      content: displayedDescription,
    },
    { name: "twitter:creator", content: "@omnidotdev" },
    { name: "twitter:url", content: displayedUrl },
    { name: "og:type", content: "website" },
    { name: "og:title", content: displayedTitle },
    {
      name: "og:description",
      content: displayedDescription,
    },
    { name: "og:url", content: displayedUrl },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "og:image", content: ogImage },
    { name: "og:image:width", content: "1200" },
    { name: "og:image:height", content: "630" },
  ];

  return tags;
};

export default createMetaTags;
