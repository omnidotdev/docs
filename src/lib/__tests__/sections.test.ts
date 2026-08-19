/**
 * Tests for realm resolution from a pathname.
 *
 * After the URL restructure, product pages live at /products/<id> and realm
 * hubs/guides at /realms/<realm>, so realm can no longer be inferred from the
 * first URL segment. These pin the new resolution: products resolve via the
 * generated PRODUCT_REALMS map, realm pages via the /realms/<realm> segment,
 * and everything else keeps the welcome/community/help fallback behavior.
 *
 * The concrete product assertion is derived from PRODUCT_REALMS so it stays
 * honest without hardcoding a private slug.
 */

import { describe, expect, it } from "vitest";

import { PRODUCT_REALMS } from "../productRealms.generated";
import { getRealmByPath } from "../sections";

// A real public product and its realm, taken from the generated map.
const [samplePublicProduct, samplePublicRealm] = Object.entries(
  PRODUCT_REALMS,
)[0] as [string, string];

describe("getRealmByPath", () => {
  it("resolves a public product URL to its mapped realm", () => {
    expect(getRealmByPath(`/products/${samplePublicProduct}`)?.id).toBe(
      samplePublicRealm,
    );
  });

  it("falls back to welcome for an unknown (private) product", () => {
    expect(getRealmByPath("/products/nonexistent-placeholder-xyz")?.id).toBe(
      "welcome",
    );
  });

  it("resolves a realm hub URL to that realm", () => {
    expect(getRealmByPath("/realms/grid")?.id).toBe("grid");
  });

  it("resolves a realm guide-page URL to that realm", () => {
    expect(getRealmByPath("/realms/codex/organizations")?.id).toBe("codex");
  });

  it("resolves an ecosystem root page to welcome", () => {
    expect(getRealmByPath("/mission")?.id).toBe("welcome");
  });

  it("resolves community and help pages to their sections", () => {
    expect(getRealmByPath("/community/pathfinder")?.id).toBe("community");
    expect(getRealmByPath("/help/support")?.id).toBe("help");
  });
});
