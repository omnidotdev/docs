import { resolveRedirect } from "@/lib/resolveRedirect";

test("legacy realm-nested -> /products", () =>
  expect(resolveRedirect("/codex/life-json")).toBe("/products/life-json"));
test("legacy sub-page", () =>
  expect(resolveRedirect("/grid/vortex/troubleshooting")).toBe(
    "/products/vortex/troubleshooting",
  ));
test("realm hub -> /realms", () =>
  expect(resolveRedirect("/armory")).toBe("/realms/armory"));
test("realm-page guide", () =>
  expect(resolveRedirect("/armory/templates")).toBe(
    "/realms/armory/templates",
  ));
test("trailing slash tolerant", () =>
  expect(resolveRedirect("/codex/life-json/")).toBe("/products/life-json"));
test("null for a current canonical url", () =>
  expect(resolveRedirect("/products/aether")).toBeNull());
test("null for ecosystem page", () =>
  expect(resolveRedirect("/mission")).toBeNull());
test("root stays null", () => expect(resolveRedirect("/")).toBeNull());
