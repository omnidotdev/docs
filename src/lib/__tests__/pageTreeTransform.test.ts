/**
 * Tests for resolving the sidebar section that contains a page.
 *
 * The sidebar opens the section holding the current page on load. Section
 * membership must come from the page tree (root `meta.json`), not a path map,
 * so a product listed under a realm separator always opens that realm, even
 * when it lives in a folder and the URL points at a nested sub-page.
 */

import { createElement } from "react";
import { describe, expect, it } from "vitest";

import transformPageTree, { getSectionIdForPath } from "../pageTreeTransform";

import type { Root } from "fumadocs-core/page-tree";

const separator = (name: string) => ({
  type: "separator" as const,
  name: createElement("span", { dangerouslySetInnerHTML: { __html: name } }),
});

const tree = transformPageTree({
  name: "Docs",
  children: [
    separator("Welcome"),
    { type: "page", name: "Mission", url: "/mission" },
    separator("Core"),
    { type: "page", name: "Core", url: "/realms/core" },
    {
      type: "folder",
      name: "Halo",
      index: { type: "page", name: "Halo", url: "/products/halo" },
      children: [
        { type: "page", name: "Orders", url: "/products/halo/orders" },
      ],
    },
    separator("Sigil"),
    { type: "page", name: "Thornberry", url: "/products/thornberry" },
  ],
} as Root);

describe("getSectionIdForPath", () => {
  it("resolves a product folder index to its realm section", () => {
    expect(getSectionIdForPath(tree, "/products/halo")).toBe("core");
  });

  it("resolves a nested product sub-page to its realm section", () => {
    expect(getSectionIdForPath(tree, "/products/halo/orders")).toBe("core");
  });

  it("ignores a trailing slash", () => {
    expect(getSectionIdForPath(tree, "/products/halo/")).toBe("core");
  });

  it("resolves top-level pages", () => {
    expect(getSectionIdForPath(tree, "/products/thornberry")).toBe("sigil");
    expect(getSectionIdForPath(tree, "/mission")).toBe("welcome");
  });

  it("returns undefined for a page outside the tree", () => {
    expect(getSectionIdForPath(tree, "/nowhere")).toBeUndefined();
  });
});
