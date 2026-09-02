import { products } from "@/lib/catalog/generated/catalog";

/**
 * Format a price in cents as a dollar string, dropping cents when whole.
 * @param cents Price in cents.
 * @returns Formatted price (e.g. "$0", "$29", "$4.99").
 */
const formatPrice = (cents: number): string => {
  if (cents === 0) return "$0";

  const dollars = cents / 100;

  return `$${
    Number.isInteger(dollars)
      ? dollars.toLocaleString()
      : dollars.toLocaleString(undefined, { minimumFractionDigits: 2 })
  }`;
};

/**
 * Format a platform fee in basis points as a percentage.
 * @param bps Fee in basis points (100 = 1%).
 * @returns Formatted percentage (e.g. "1%", "0.5%").
 */
const formatFee = (bps: number): string => {
  const percent = bps / 100;

  // up to two decimals, without trailing zeros (0.5%, not 0.50%; 1%, not 1.00%)
  return `${Number.parseFloat(percent.toFixed(2))}%`;
};

interface PricingProps {
  /**
   * Product ID (slug) whose plans to render, e.g. "halo". Plans come from the
   * omni-api catalog (SSOT) vendored into the generated catalog.
   */
  productId: string;
  /**
   * Whether to show the annual price column. Defaults to true.
   */
  annual?: boolean;
  /**
   * Whether to show a column listing each plan's headline features. Defaults to
   * false.
   */
  features?: boolean;
}

/**
 * Pricing table sourced from the omni-api product catalog. Renders a product's
 * plans (tier, monthly/annual price, per-sale platform fee where one applies,
 * and optionally its headline features) so pricing stays in sync with the SSOT
 * instead of being hardcoded.
 */
const Pricing: React.FC<PricingProps> = ({
  productId,
  annual = true,
  features = false,
}) => {
  const product = products.find((p) => p.id === productId);
  const plans = product?.plans;

  if (!plans?.length) return null;

  const hasFee = plans.some((plan) => plan.transactionFeeBps != null);

  const cell = "border border-fd-border px-4 py-2 text-left align-top";

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-fd-muted/50">
            <th className={`${cell} font-medium`}>Plan</th>
            <th className={`${cell} font-medium`}>Monthly</th>
            {annual && <th className={`${cell} font-medium`}>Annual</th>}
            {hasFee && (
              <th className={`${cell} font-medium`}>Platform fee per sale</th>
            )}
            {features && <th className={`${cell} font-medium`}>Features</th>}
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.tier}>
              <td className={cell}>{plan.name}</td>
              <td className={cell}>{formatPrice(plan.monthlyPrice)}</td>
              {annual && (
                <td className={cell}>
                  {plan.yearlyPrice === 0
                    ? formatPrice(0)
                    : `${formatPrice(plan.yearlyPrice)}/yr`}
                </td>
              )}
              {hasFee && (
                <td className={cell}>
                  {plan.transactionFeeBps != null
                    ? formatFee(plan.transactionFeeBps)
                    : "-"}
                </td>
              )}
              {features && (
                <td className={cell}>
                  {plan.features.length ? (
                    <ul className="my-0 list-disc space-y-1 ps-4">
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    "-"
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pricing;
