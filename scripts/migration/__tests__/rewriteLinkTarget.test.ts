/**
 * Unit tests for rewriteLinkTarget: exact product, sub-page, hub, realm-page,
 * anchor preservation, and unknown-path passthrough.
 */

import { describe, expect, test } from "vitest";

import { rewriteLinkTarget } from "../rewriteLinkTarget";

import type { LinkMap } from "../rewriteLinkTarget";

const map: LinkMap = new Map([
  ["/armory/aether", "/products/aether"],
  ["/armory/aether/sub", "/products/aether/sub"],
  ["/armory", "/realms/armory"],
  ["/codex/organizations", "/realms/codex/organizations"],
  ["/grid/vortex", "/products/vortex"],
  ["/grid/vortex/webhooks", "/products/vortex/webhooks"],
]);

describe("rewriteLinkTarget", () => {
  test("exact product url", () => {
    expect(rewriteLinkTarget("/armory/aether", map)).toBe("/products/aether");
  });

  test("sub-page via exact per-page key", () => {
    expect(rewriteLinkTarget("/grid/vortex/webhooks", map)).toBe(
      "/products/vortex/webhooks",
    );
  });

  test("realm hub", () => {
    expect(rewriteLinkTarget("/armory", map)).toBe("/realms/armory");
  });

  test("realm page", () => {
    expect(rewriteLinkTarget("/codex/organizations", map)).toBe(
      "/realms/codex/organizations",
    );
  });

  test("trailing anchor preserved", () => {
    expect(rewriteLinkTarget("/armory/aether/sub#anchor", map)).toBe(
      "/products/aether/sub#anchor",
    );
  });

  test("anchor and query preserved together", () => {
    expect(rewriteLinkTarget("/grid/vortex/webhooks#a?x=1", map)).toBe(
      "/products/vortex/webhooks#a?x=1",
    );
  });

  test("longest-prefix match for an unmapped deep sub-path", () => {
    // no exact key for this deep path, so the longest prefix (/grid/vortex) wins
    expect(rewriteLinkTarget("/grid/vortex/deep/page", map)).toBe(
      "/products/vortex/deep/page",
    );
  });

  test("unknown path unchanged", () => {
    expect(rewriteLinkTarget("/help/support", map)).toBe("/help/support");
  });

  test("prefix boundary is respected", () => {
    // /armory-x must not match the /armory key
    expect(rewriteLinkTarget("/armory-x/page", map)).toBe("/armory-x/page");
  });
});
