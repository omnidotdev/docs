/**
 * Product docs mirror manifest.
 *
 * docs.omni.dev is an aggregator, not the source of truth. Each product that
 * keeps its own docs owns them in its own repo; this manifest lists which of
 * those to mirror into `content/docs/products/<id>/` at build time so the docs
 * surface here without duplicating authorship. See `syncProductDocs.ts`.
 *
 * The single source of truth stays with each product. Bump `ref` (and re-run
 * `bun run docs:sync`) to publish new upstream content; the mirrored files are
 * committed so a build without repo access ships the last good copy.
 */

export interface ProductDocsMirror {
  /** Product id; content mirrors into `content/docs/products/<id>/` */
  id: string;
  /** Sidebar/section label for the mirrored folder */
  title: string;
  /** Git URL of the product's own docs repo (the source of truth) */
  repo: string;
  /** Pinned commit to mirror; bump to publish new upstream content */
  ref: string;
  /** Path within the repo to the docs content root */
  contentDir: string;
  /** Canonical docs origin, e.g. https://docs.thrivestream.live */
  canonicalOrigin: string;
  /**
   * Optional MDX prepended to the section index, for Omni-side framing (an
   * aggregator note, an apply CTA). Kept in the manifest so the mirror stays a
   * verbatim copy the sync never has to hand-edit.
   */
  indexBanner?: string;
}

export const productDocsMirrors: ProductDocsMirror[] = [
  {
    id: "thrivestream",
    title: "📡 Thrivestream",
    repo: "git@github.com:coopbri/thrivestream-docs.git",
    ref: "3a79734ef0fddc2054626b4b9c73e328e89b7cad",
    contentDir: "content/docs",
    canonicalOrigin: "https://docs.thrivestream.live",
    indexBanner: [
      '<Callout type="info">',
      "  These docs mirror [docs.thrivestream.live](https://docs.thrivestream.live), the canonical Thrivestream documentation. Want to go live? **[Apply to become a streamer](https://thrivestream.live/apply)**.",
      "</Callout>",
    ].join("\n"),
  },
];
