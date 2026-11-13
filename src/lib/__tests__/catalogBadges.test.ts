/**
 * Tests for the sidebar "New" / "Coming soon" badge rules.
 */

import { describe, expect, it } from "vitest";

import {
  NEW_WINDOW_DAYS,
  deriveBadges,
  labelNamesProduct,
  sidebarLabel,
} from "../catalog/badges";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.parse("2026-11-13T12:00:00Z");
const daysAgo = (days: number) =>
  new Date(now - days * DAY_MS).toISOString().slice(0, 10);

describe("deriveBadges", () => {
  it("badges a product released inside the window as new", () => {
    const { newProducts } = deriveBadges(
      [{ name: "Halo", status: "active", releaseDate: daysAgo(1) }],
      now,
    );

    expect(newProducts).toEqual(["Halo"]);
  });

  it("ages a product out of the new badge after the window", () => {
    const { newProducts } = deriveBadges(
      [
        {
          name: "Runa",
          status: "active",
          releaseDate: daysAgo(NEW_WINDOW_DAYS + 1),
        },
      ],
      now,
    );

    expect(newProducts).toEqual([]);
  });

  it("never badges a coming-soon product as new", () => {
    const badges = deriveBadges(
      [{ name: "Halo", status: "coming_soon", releaseDate: daysAgo(1) }],
      now,
    );

    expect(badges.newProducts).toEqual([]);
    expect(badges.comingSoonProducts).toEqual(["Halo"]);
  });

  it("does not badge a future release date as new", () => {
    const { newProducts } = deriveBadges(
      [{ name: "Halo", status: "active", releaseDate: daysAgo(-3) }],
      now,
    );

    expect(newProducts).toEqual([]);
  });

  it("ignores a missing or malformed release date", () => {
    const { newProducts } = deriveBadges(
      [
        { name: "A", status: "active" },
        { name: "B", status: "active", releaseDate: "not-a-date" },
      ],
      now,
    );

    expect(newProducts).toEqual([]);
  });
});

describe("labelNamesProduct", () => {
  it("does not lend a badge to a product whose name contains another", () => {
    expect(labelNamesProduct("🌙 Runa", ["Run"])).toBe(false);
  });

  it("matches the product name next to an emoji", () => {
    expect(labelNamesProduct("🏃 Run", ["Run"])).toBe(true);
    expect(labelNamesProduct("😇 Halo", ["Halo"])).toBe(true);
  });

  it("matches multi-word names and escapes regex characters", () => {
    expect(labelNamesProduct("Omni CLI", ["Omni CLI"])).toBe(true);
    expect(labelNamesProduct("C++ Kit", ["C++"])).toBe(true);
  });
});

describe("sidebarLabel", () => {
  it("reads a rendered-HTML name", () => {
    expect(
      sidebarLabel({
        name: { props: { dangerouslySetInnerHTML: { __html: "🏃 Run" } } },
      }),
    ).toBe("🏃 Run");
  });

  it("reads a plain string name", () => {
    expect(sidebarLabel({ name: "Halo" })).toBe("Halo");
  });

  it("returns an empty label for anything else", () => {
    expect(sidebarLabel({})).toBe("");
  });
});
