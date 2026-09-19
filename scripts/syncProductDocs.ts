/**
 * Mirror per-product docs into this aggregator.
 *
 * docs.omni.dev does not author product docs; it aggregates them. For each
 * entry in `productDocs.config.ts` this clones the product's own docs repo at a
 * pinned ref and copies its content into `content/docs/products/<id>/`, so the
 * pages render here (search, sidebar, LLM copy) while the source of truth stays
 * with the product. Mirrored files are committed, so a build without repo
 * access ships the last good copy (mirrors the `generateCatalog` philosophy);
 * on a successful fetch the mirror is rewritten from scratch.
 *
 * Two transforms make an upstream copy fit under `/products/<id>/`:
 *  - root-relative links (`/going-live`) are prefixed with the mount path, since
 *    upstream authors them for its own root
 *  - a `canonical` (pointing back to the product's own docs domain) and a
 *    `mirroredFrom` provenance field are injected into every page's frontmatter
 *
 * Never hand-edit files under a mirrored folder; edit the upstream repo and bump
 * `ref`.
 */

import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

import { productDocsMirrors } from "./productDocs.config";

import type { ProductDocsMirror } from "./productDocs.config";

const contentRoot = resolve(import.meta.dir, "../content/docs/products");

const log = (message: string) =>
  // biome-ignore lint/suspicious/noConsole: build script output
  console.log(`[product-docs] ${message}`);

const warn = (message: string) =>
  // biome-ignore lint/suspicious/noConsole: build script output
  console.warn(`[product-docs] ${message}`);

/** Clone a repo at a pinned ref into a throwaway dir, returning its path */
const checkout = (mirror: ProductDocsMirror): string => {
  const dir = mkdtempSync(join(tmpdir(), `omni-docs-${mirror.id}-`));
  execFileSync("git", ["clone", "--quiet", mirror.repo, dir], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  execFileSync("git", ["-C", dir, "checkout", "--quiet", mirror.ref], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  return dir;
};

/** Turn a mirrored file's relative path into its canonical URL path */
const urlPath = (relPath: string): string => {
  const noExt = relPath.replace(/\.mdx$/, "");
  if (noExt === "index") return "";
  return `/${noExt.replace(/\/index$/, "")}`;
};

/** Browsable URL of the upstream source file, for the page's "view source" link */
const upstreamSourceUrl = (
  mirror: ProductDocsMirror,
  relPath: string,
): string => {
  const https = mirror.repo
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/\.git$/, "");
  return `${https}/blob/${mirror.ref}/${mirror.contentDir}/${relPath}`;
};

/** Prefix upstream root-relative links with the product mount path */
const rewriteLinks = (source: string, mount: string): string =>
  source
    // markdown links: [text](/path) and [text](/path#anchor)
    .replace(/\]\((\/[^)]*)\)/g, (match, href: string) => {
      if (href.startsWith("//")) return match; // protocol-relative
      if (href === mount || href.startsWith(`${mount}/`)) return match;
      return `](${mount}${href})`;
    })
    // JSX href="/path" / href='/path'
    .replace(
      /href=(["'])(\/[^"']*)\1/g,
      (match, quote: string, href: string) => {
        if (href.startsWith("//")) return match;
        if (href === mount || href.startsWith(`${mount}/`)) return match;
        return `href=${quote}${mount}${href}${quote}`;
      },
    );

/** Inject canonical + provenance frontmatter and any index banner */
const transformMdx = (
  raw: string,
  relPath: string,
  mirror: ProductDocsMirror,
): string => {
  const mount = `/products/${mirror.id}`;
  const canonical = `${mirror.canonicalOrigin}${urlPath(relPath)}`;

  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) {
    warn(`no frontmatter in ${relPath}, mirroring body only`);
  }
  const frontmatter = fmMatch ? fmMatch[1] : "";
  let body = fmMatch ? raw.slice(fmMatch[0].length) : raw;

  body = rewriteLinks(body, mount);

  if (relPath === "index.mdx" && mirror.indexBanner) {
    body = `\n${mirror.indexBanner}\n${body}`;
  }

  const injected = [
    frontmatter,
    `canonical: "${canonical}"`,
    `mirroredFrom: "${mirror.repo}@${mirror.ref}"`,
    `sourceUrl: "${upstreamSourceUrl(mirror, relPath)}"`,
  ]
    .filter(Boolean)
    .join("\n");

  return `---\n${injected}\n---\n${body}`;
};

/** Copy the section's root meta.json, ensuring a titled folder label */
const writeMeta = (
  srcMeta: string | undefined,
  destDir: string,
  title: string,
) => {
  const meta = srcMeta ? JSON.parse(srcMeta) : { pages: [] };
  // the aggregator owns the folder label; upstream title (if any) is overridden
  const merged = { title, ...meta };
  merged.title = title;
  writeFileSync(
    join(destDir, "meta.json"),
    `${JSON.stringify(merged, null, 2)}\n`,
  );
};

/** Recursively mirror .mdx and meta.json from src into dest with transforms */
const mirrorTree = (
  srcDir: string,
  destDir: string,
  rootDir: string,
  mirror: ProductDocsMirror,
) => {
  for (const entry of readdirSync(srcDir)) {
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);

    if (statSync(srcPath).isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      mirrorTree(srcPath, destPath, rootDir, mirror);
      continue;
    }

    const relPath = relative(rootDir, srcPath);

    // the section-root meta.json is handled separately to inject the title
    if (entry === "meta.json" && srcDir === rootDir) continue;

    if (entry.endsWith(".mdx")) {
      writeFileSync(
        destPath,
        transformMdx(readFileSync(srcPath, "utf8"), relPath, mirror),
      );
    } else if (entry === "meta.json") {
      cpSync(srcPath, destPath);
    }
  }
};

const syncMirror = (mirror: ProductDocsMirror) => {
  const destDir = join(contentRoot, mirror.id);

  let checkoutDir: string | undefined;
  try {
    checkoutDir = checkout(mirror);
  } catch (error) {
    warn(
      `could not fetch ${mirror.repo}@${mirror.ref.slice(0, 8)} (${error}); keeping committed mirror for "${mirror.id}"`,
    );
    return;
  }

  try {
    const srcRoot = join(checkoutDir, mirror.contentDir);

    // rebuild the mirror from scratch so removed upstream pages disappear
    rmSync(destDir, { recursive: true, force: true });
    mkdirSync(destDir, { recursive: true });

    mirrorTree(srcRoot, destDir, srcRoot, mirror);

    const rootMetaPath = join(srcRoot, "meta.json");
    let rootMeta: string | undefined;
    try {
      rootMeta = readFileSync(rootMetaPath, "utf8");
    } catch {
      rootMeta = undefined;
    }
    writeMeta(rootMeta, destDir, mirror.title);

    // provenance marker for the generated folder; kept stable (no timestamp) so
    // the committed mirror does not churn on every build-time sync
    writeFileSync(
      join(destDir, ".mirror.json"),
      `${JSON.stringify({ repo: mirror.repo, ref: mirror.ref }, null, 2)}\n`,
    );

    log(`mirrored "${mirror.id}" from ${mirror.ref.slice(0, 8)}`);
  } finally {
    rmSync(checkoutDir, { recursive: true, force: true });
  }
};

for (const mirror of productDocsMirrors) syncMirror(mirror);
