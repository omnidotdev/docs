# Docs Agent Rules

Guidance for AI agents and contributors working in the Omni docs repo.

**This repo is PUBLIC.** Everything committed, including git history, is world-readable.

## Unlaunched products must never enter the public docs

A product is "launched" only when it is `isPublic: true` in the omni-api catalog SSOT
(`~/projects/omni/api-stack/services/api/src/lib/db/catalog/products.ts`), which the website's
catalog generation mirrors. Until a product is launched, its existence, name, features, and pages
must not appear in anything that gets committed.

When you encounter or are asked to add docs for a not-yet-launched product:

- **Keep the draft entirely out of this repo.** Store it somewhere local and outside any git repo
  (e.g. under `~/omni-private/`). Do not keep the file in the working tree, even gitignored: a
  gitignore entry or filename still names the product in a public, committed file.
- **Do not comment it out.** Commented-out content still lands in git history, which defeats the
  purpose on a public repo.
- **Remove every reference from tracked files**: nav `meta.json` entries, cross-links from other
  product pages, and prose that names the product. Do not leave those references commented out.
- **Re-add** the page, its nav entry, and cross-links only once the product is `isPublic: true`.

If a reference has already been committed, it is in public history: removing it from HEAD is not
enough. Scrub it with a history rewrite and force-push, and treat it as already-exposed.

Rationale: on 2026-08-18 a public product page linked to an unlaunched product's page. The link was
broken on the live site and revealed a product that was not meant to be public yet.
