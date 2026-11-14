import { cn } from "@/lib/utils";

interface OmniMarkProps {
  /** Additional classes (size, color). */
  className?: string;
}

/**
 * The official Omni mark, drawn from the shipped `/svg/logo.svg` asset as a CSS
 * mask so it takes the surrounding text color like the section icons beside it.
 *
 * @param props - Component props.
 * @param props.className - Additional classes (size, color).
 * @returns The Omni mark, decorative (hidden from assistive tech).
 */
const OmniMark = ({ className }: OmniMarkProps) => (
  <span
    aria-hidden="true"
    className={cn("inline-block shrink-0 bg-current", className)}
    style={{
      maskImage: "url(/svg/logo.svg)",
      WebkitMaskImage: "url(/svg/logo.svg)",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskPosition: "center",
      WebkitMaskPosition: "center",
    }}
  />
);

export default OmniMark;
