import app from "@/lib/config/app.config";

interface Params {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  url?: string;
}

/**
 * Create meta tags.
 */
const createMetaTags = ({
  title,
  description,
  image,
  keywords,
  url,
}: Params = {}) => {
  const displayedTitle = title ? `${app.name.long} | ${title}` : app.name.long;
  const displayedDescription = description ?? app.description;
  const displayedUrl = url ?? app.appUrl;

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
    ...(image
      ? [
          { name: "twitter:image", content: image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "og:image", content: image },
        ]
      : [
          { name: "twitter:image", content: "/img/omni-logo.png" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "og:image", content: "/img/omni-logo.png" },
        ]),
  ];

  return tags;
};

export default createMetaTags;
