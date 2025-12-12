import { Banner } from "fumadocs-ui/components/banner";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";

/**
 * Fade duration in milliseconds.
 */
const FADE_MS = 250;
/**
 * Rotation duration in milliseconds.
 */
const ROTATE_MS = 30_000;

// TODO from API
const items = [
  {
    text: "Omni builds open source software for everyone",
  },
  {
    text: (
      <div className="flex gap-1">
        <span>📣 Organize your user feedback with</span>
        <a
          href="https://backfeed.omni.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 border-b-border-b-fd-accent font-bold"
        >
          <span className="font-bold underline">Backfeed →</span>
        </a>
      </div>
    ),
    // TODO tokens
    rainbowColors: ["#ef4444", "#dc2626", "#b91c1c"],
  },
  {
    text: (
      <div className="flex gap-2">
        <span>🌙 Runa helps teams move faster</span>

        <Badge className="no-underline!">Coming Soon</Badge>
      </div>
    ),
    // TODO tokens
    rainbowColors: ["#facc15", "#fde68a", "#fbbf24"],
  },
];

/**
 * Rotating layout banner. Useful for announcements.
 */
const RotatingBanner = () => {
  const [index, setIndex] = useState(() =>
    // start at random pick
    Math.floor(Math.random() * items.length),
  );

  const [fade, setFade] = useState(true);

  const rotate = (dir: number) => {
    setFade(false);

    setTimeout(() => {
      setIndex((idx) => (idx + dir + items.length) % items.length);

      setFade(true);
    }, FADE_MS);
  };

  // rotate content
  // biome-ignore lint/correctness/useExhaustiveDependencies: dependency changes on every re-render
  useEffect(() => {
    const id = setInterval(() => rotate(1), ROTATE_MS);

    return () => clearInterval(id);
  }, []);

  const { text, rainbowColors } = items[index];

  return (
    <Banner
      variant="rainbow"
      rainbowColors={rainbowColors}
      className="relative"
    >
      {/* nav left */}
      <button
        type="button"
        onClick={() => rotate(-1)}
        className="-translate-y-1/2 absolute top-1/2 left-3 z-10 cursor-pointer opacity-70 hover:opacity-100"
        aria-label="Previous"
      >
        <FaArrowLeft />
      </button>

      {/* fading content */}
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {text}
      </div>

      {/* nav right */}
      <button
        type="button"
        onClick={() => rotate(1)}
        className="-translate-y-1/2 absolute top-1/2 right-3 z-10 cursor-pointer opacity-70 hover:opacity-100"
        aria-label="Next"
      >
        <FaArrowRight />
      </button>
    </Banner>
  );
};

export default RotatingBanner;
