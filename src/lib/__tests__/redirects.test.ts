/**
 * Contract tests for the generated legacy-URL redirect map.
 *
 * These assert only against LEGACY_REDIRECTS itself (never the migration data
 * files, which are local-only and gitignored because they carry private slugs),
 * so the suite stays self-contained in CI. They pin the invariants the map must
 * satisfy so that `throw redirect(301)` at the edge never points a visitor at a
 * chain or at itself.
 */

import { describe, expect, it } from "vitest";

import { LEGACY_REDIRECTS } from "../redirects.generated";

const entries = Object.entries(LEGACY_REDIRECTS);

describe("LEGACY_REDIRECTS", () => {
  it("targets only the new URL scheme (/products or /realms)", () => {
    for (const [key, to] of entries)
      expect(
        to.startsWith("/products/") || to.startsWith("/realms/"),
        `target for ${key} must be under /products or /realms, got ${to}`,
      ).toBe(true);
  });

  it("has no chains: no target is itself a redirect key", () => {
    for (const [key, to] of entries)
      expect(
        LEGACY_REDIRECTS[to],
        `target ${to} (from ${key}) must not be a key`,
      ).toBeUndefined();
  });

  it("never maps a key to itself", () => {
    for (const [key, to] of entries)
      expect(to, `${key} must not map to itself`).not.toBe(key);
  });

  it("contains the expected public redirects", () => {
    expect(LEGACY_REDIRECTS["/codex/life-json"]).toBe("/products/life-json");
    expect(LEGACY_REDIRECTS["/armory/templates"]).toBe(
      "/realms/armory/templates",
    );
    expect(LEGACY_REDIRECTS["/codex"]).toBe("/realms/codex");
  });

  it("was scrubbed to the public subset (size sanity)", () => {
    const size = Object.keys(LEGACY_REDIRECTS).length;
    // The full pre-scrub map had 224 entries; the public subset is ~102
    expect(size).toBeGreaterThan(50);
    expect(size).toBeLessThan(224);
    expect(size).toBe(102);
  });
});
