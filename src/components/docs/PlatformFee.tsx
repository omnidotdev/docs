import { products } from "@/lib/catalog/generated/catalog";
import { formatFee } from "./Pricing";

interface PlatformFeeProps {
  /**
   * Product ID (slug) whose per-sale platform fee to render, e.g. "crystal".
   * The fee comes from the omni-api catalog (SSOT).
   */
  productId: string;
}

/**
 * Renders a product's flat per-sale platform fee (e.g. "4%") inline, sourced
 * from the catalog so prose does not hardcode the number. For products whose
 * fee is the same across every tier; renders nothing if no fee is set.
 */
const PlatformFee: React.FC<PlatformFeeProps> = ({ productId }) => {
  const product = products.find((p) => p.id === productId);
  const bps = product?.plans?.find(
    (plan) => plan.transactionFeeBps != null,
  )?.transactionFeeBps;

  if (bps == null) return null;

  return <>{formatFee(bps)}</>;
};

export default PlatformFee;
