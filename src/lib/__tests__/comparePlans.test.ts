import { describe, expect, it } from "vitest";

import comparePlans from "@/lib/catalog/comparePlans";

const plan = (tier: string, monthlyPrice: number) => ({ tier, monthlyPrice });

const order = (plans: ReturnType<typeof plan>[]) =>
  [...plans].sort(comparePlans).map((p) => p.tier);

describe("comparePlans", () => {
  it("orders plans cheapest first", () => {
    expect(
      order([plan("team", 2500), plan("free", 0), plan("pro", 1000)]),
    ).toEqual(["free", "pro", "team"]);
  });

  // A $0 non-free tier is "contact sales" (e.g. Herald Enterprise): it ties the
  // free tier on price, so without a tie-break regenerations flip their order
  it("puts a $0 contact-sales tier after every paid tier", () => {
    const plans = [
      plan("enterprise", 0),
      plan("free", 0),
      plan("starter", 1800),
      plan("scale", 49900),
    ];

    expect(order(plans)).toEqual(["free", "starter", "scale", "enterprise"]);
    expect(order([...plans].reverse())).toEqual([
      "free",
      "starter",
      "scale",
      "enterprise",
    ]);
  });

  it("breaks equal-price ties by tier name", () => {
    expect(order([plan("b", 500), plan("a", 500)])).toEqual(["a", "b"]);
  });
});
