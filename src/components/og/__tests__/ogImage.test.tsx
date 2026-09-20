/**
 * Regression tests for the OG image generator.
 *
 * The docs OG route (`/og/$`) renders <OgImage> through Satori (JSX to SVG)
 * and resvg (SVG to PNG). Satori renders a component by invoking it directly
 * with no React renderer active, so any component in the tree that calls a
 * React hook throws and the route 500s for EVERY page. That is exactly what a
 * lucide-react v1 icon component did (its icons read a context via a hook),
 * taking down every docs OG image at once.
 *
 * These tests render the real component through the real Satori + resvg
 * pipeline for the homepage and every realm (each realm exercises the footer
 * icon path that broke), and assert a valid PNG comes out. If a hook-using
 * component is ever put back into the Satori tree, Satori throws here and the
 * suite fails before it can ship.
 */

import { readFileSync } from "node:fs";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { describe, expect, it } from "vitest";

import realmsData from "../../../../realms.json";
import OgImage from "../OgImage";

type Realm = (typeof realmsData.realms)[number];

// Vendored copy of the same Roboto face the route fetches at runtime, so the
// render is hermetic (no network) and deterministic.
const fontData = readFileSync(
  new URL("./fixtures/Roboto-Regular.ttf", import.meta.url),
);

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Render OgImage through the production pipeline and return the PNG bytes. */
const renderOgPng = async (
  realm: Realm | null,
  label?: string,
): Promise<Buffer> => {
  const svg = await satori(
    <OgImage
      title={realm?.name ?? "Omni Docs"}
      description={realm?.tagline ?? "Documentation for the Omni ecosystem"}
      realm={realm}
      label={label}
    />,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Roboto", data: fontData, weight: 400, style: "normal" }],
    },
  );

  expect(svg.startsWith("<svg")).toBe(true);

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    // Satori already vectorizes text to paths, so resvg needs no fonts.
    // Skipping the system-font scan keeps each render ~30ms instead of ~10s.
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();

  return Buffer.from(png);
};

const assertValidPng = (png: Buffer): void => {
  expect(png.length).toBeGreaterThan(1000);
  expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
};

describe("OG image generation", () => {
  it("renders the homepage card (no realm) as a valid PNG", async () => {
    assertValidPng(await renderOgPng(null));
  });

  // Every realm renders its footer icon inside the Satori tree, so this is the
  // regression guard for the lucide-in-Satori 500.
  it.each(realmsData.realms.map((realm) => [realm.id, realm] as const))(
    "renders the %s realm card as a valid PNG",
    async (_id, realm) => {
      assertValidPng(await renderOgPng(realm));
    },
  );

  // A product page shows the product name in the footer while keeping its
  // realm's icon and color.
  it("renders a product card (realm + product label) as a valid PNG", async () => {
    const realm = realmsData.realms.find((r) => r.id === "grid") ?? null;
    assertValidPng(await renderOgPng(realm, "Fractal"));
  });
});
