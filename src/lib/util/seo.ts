import app from "@/lib/config/app.config";

const seo = ({
  title,
  description,
  keywords,
  image,
  url,
}: {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  url?: string;
} = {}) => {
  const shownTitle = title ? `${app.name.long} | ${title}` : app.name.long;
  const shownDescription = description ?? app.description;
  const shownUrl = url ?? app.appUrl;

  const tags = [
    { title: shownTitle },
    {
      name: "description",
      content: shownDescription,
    },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: shownTitle },
    {
      name: "twitter:description",
      content: shownDescription,
    },
    { name: "twitter:creator", content: "@omnidotdev" },
    { name: "twitter:url", content: shownUrl },
    { name: "og:type", content: "website" },
    { name: "og:title", content: shownTitle },
    {
      name: "og:description",
      content: shownDescription,
    },
    { name: "og:url", content: shownUrl },
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

export default seo;
