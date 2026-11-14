interface SortablePlan {
  tier: string;
  monthlyPrice: number;
}

/**
 * Pricing-table order for a product's plans: cheapest first, with a $0 tier
 * other than "free" (a contact-sales tier such as Enterprise) after every paid
 * tier, and equal prices broken by tier name so regenerations are stable.
 * @param a First plan.
 * @param b Second plan.
 * @returns Sort comparator result.
 */
const comparePlans = (a: SortablePlan, b: SortablePlan): number => {
  const rank = (plan: SortablePlan) =>
    plan.monthlyPrice === 0 && plan.tier !== "free"
      ? Number.POSITIVE_INFINITY
      : plan.monthlyPrice;

  const ra = rank(a);
  const rb = rank(b);

  if (ra !== rb) return ra < rb ? -1 : 1;

  return a.tier.localeCompare(b.tier);
};

export default comparePlans;
