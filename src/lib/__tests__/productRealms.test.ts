/**
 * Tests for the nav-derived product -> realm map.
 *
 * The map is derived from the root `content/docs/meta.json`, so it cannot drift
 * from the sidebar. These pin the derivation rules and guard the nav against
 * filing a product under a realm the omni-api catalog disagrees with.
 */

import { describe, expect, it } from "vitest";

import { products as catalog } from "@/lib/catalog/generated/catalog";
import docsMeta from "../../../content/docs/meta.json";
import realmsData from "../../../realms.json";
import { PRODUCT_REALMS, deriveProductRealms } from "../productRealms";

const REALM_IDS = realmsData.realms.map((realm) => realm.id);

describe("deriveProductRealms", () => {
  it("files products under the realm separator they follow", () => {
    expect(
      deriveProductRealms(
        [
          "---Core---",
          "realms/core/index",
          "products/alpha",
          "---Grid---",
          "products/beta",
          "realms/grid/guide",
        ],
        REALM_IDS,
      ),
    ).toEqual({ alpha: "core", beta: "grid" });
  });

  it("ignores products outside a realm section", () => {
    expect(
      deriveProductRealms(
        ["---Welcome---", "products/alpha", "---Help---", "products/beta"],
        REALM_IDS,
      ),
    ).toEqual({});
  });

  it("ignores nested product pages and non-product entries", () => {
    expect(
      deriveProductRealms(
        ["---Core---", "products/alpha/guide", "products", "...learn"],
        REALM_IDS,
      ),
    ).toEqual({});
  });
});

describe("PRODUCT_REALMS", () => {
  const navProducts = docsMeta.pages
    .map((page) => page.match(/^products\/([^/]+)$/)?.[1])
    .filter((id): id is string => Boolean(id));

  it("maps every product listed in the root nav", () => {
    expect(navProducts.length).toBeGreaterThan(0);
    expect(Object.keys(PRODUCT_REALMS).sort()).toEqual([...navProducts].sort());
  });

  it.each(
    navProducts.map((id) => [id, catalog.find((p) => p.id === id)] as const),
  )("files %s under its catalog realm", (id, product) => {
    if (!product?.realm) return;

    expect(PRODUCT_REALMS[id]).toBe(product.realm);
  });
});
