import blueprintMeta from "content/docs/blueprint/meta.json";
import communityMeta from "content/docs/community/meta.json";
import coreMeta from "content/docs/core/meta.json";
import forgeMeta from "content/docs/forge/meta.json";
import helpMeta from "content/docs/help/meta.json";
import rootMeta from "content/docs/meta.json";
import realityMeta from "content/docs/reality/meta.json";
import sigilMeta from "content/docs/sigil/meta.json";

// TODO rename description -> tagline
export interface Pillar {
  id: string;
  name: string;
  description: string;
  paths: string[];
  gradients: {
    open: string;
    hover: string;
    closed: string;
  };
}

// TODO fetch from Omni API
export const PILLARS: Pillar[] = [
  {
    id: "welcome",
    name: rootMeta.title,
    description: rootMeta.tagline,
    paths: ["/"],
    gradients: {
      open: "bg-gradient-to-r from-emerald-200/60 via-green-200/50 to-teal-200/60 dark:from-emerald-800/90 dark:via-green-900/80 dark:to-teal-900/90",
      hover:
        "hover:bg-gradient-to-r hover:from-emerald-100/50 hover:via-green-100/40 hover:to-teal-100/50 dark:hover:from-emerald-700/70 dark:hover:via-green-800/60 dark:hover:to-teal-800/70 hover:shadow-md hover:shadow-emerald-500/10",
      closed:
        "bg-gradient-to-r from-emerald-100/80 via-green-100/70 to-teal-100/80 dark:from-emerald-800/20 dark:via-green-900/15 dark:to-teal-900/20",
    },
  },
  {
    id: "core",
    name: coreMeta.title,
    description: coreMeta.tagline,
    paths: ["/(core)/", "/core/"],
    gradients: {
      open: "bg-gradient-to-r from-blue-200/60 via-blue-200/50 to-indigo-200/60 dark:from-blue-800/90 dark:via-blue-900/80 dark:to-indigo-900/90",
      hover:
        "hover:bg-gradient-to-r hover:from-blue-100/50 hover:via-blue-100/40 hover:to-indigo-100/50 dark:hover:from-blue-700/70 dark:hover:via-blue-800/60 dark:hover:to-indigo-800/70 hover:shadow-md hover:shadow-blue-500/10",
      closed:
        "bg-gradient-to-r from-blue-100/80 via-blue-100/70 to-indigo-100/80 dark:from-blue-800/20 dark:via-blue-900/15 dark:to-indigo-900/20",
    },
  },
  {
    id: "reality",
    name: realityMeta.title,
    description: realityMeta.tagline,
    paths: ["/(reality)/", "/reality/"],
    gradients: {
      open: "bg-gradient-to-r from-purple-200/60 via-violet-200/50 to-purple-200/60 dark:from-purple-800/90 dark:via-violet-900/80 dark:to-purple-900/90",
      hover:
        "hover:bg-gradient-to-r hover:from-purple-100/50 hover:via-violet-100/40 hover:to-purple-100/50 dark:hover:from-purple-700/70 dark:hover:via-violet-800/60 dark:hover:to-purple-800/70 hover:shadow-md hover:shadow-purple-500/10",
      closed:
        "bg-gradient-to-r from-purple-100/80 via-violet-100/70 to-purple-100/80 dark:from-purple-800/20 dark:via-violet-900/15 dark:to-purple-900/20",
    },
  },
  {
    id: "sigil",
    name: sigilMeta.title,
    description: sigilMeta.tagline,
    paths: ["/(sigil)/", "/sigil/"],
    gradients: {
      open: "bg-gradient-to-r from-rose-200/60 via-red-200/50 to-pink-200/60 dark:from-rose-800/90 dark:via-red-900/80 dark:to-pink-900/90",
      hover:
        "hover:bg-gradient-to-r hover:from-rose-100/50 hover:via-red-100/40 hover:to-pink-100/50 dark:hover:from-rose-700/70 dark:hover:via-red-800/60 dark:hover:to-pink-800/70 hover:shadow-md hover:shadow-rose-500/10",
      closed:
        "bg-gradient-to-r from-rose-100/80 via-red-100/70 to-pink-100/80 dark:from-rose-800/20 dark:via-red-900/15 dark:to-pink-900/20",
    },
  },
  {
    id: "blueprint",
    name: blueprintMeta.title,
    description: blueprintMeta.tagline,
    paths: ["/(specs-standards)/", "/blueprint/"],
    gradients: {
      open: "bg-gradient-to-r from-amber-200/60 via-yellow-200/50 to-orange-200/60 dark:from-amber-800/90 dark:via-yellow-900/80 dark:to-orange-900/90",
      hover:
        "hover:bg-gradient-to-r hover:from-amber-100/50 hover:via-yellow-100/40 hover:to-orange-100/50 dark:hover:from-amber-700/70 dark:hover:via-yellow-800/60 dark:hover:to-orange-800/70 hover:shadow-md hover:shadow-amber-500/10",
      closed:
        "bg-gradient-to-r from-amber-100/80 via-yellow-100/70 to-orange-100/80 dark:from-amber-800/20 dark:via-yellow-900/15 dark:to-orange-900/20",
    },
  },
  {
    id: "forge",
    name: forgeMeta.title,
    description: forgeMeta.tagline,
    paths: ["/(forge)/", "/forge/"],
    gradients: {
      open: "bg-gradient-to-r from-slate-200/60 via-gray-200/50 to-zinc-200/60 dark:from-slate-800/90 dark:via-gray-900/80 dark:to-zinc-900/90",
      hover:
        "hover:bg-gradient-to-r hover:from-slate-100/50 hover:via-gray-100/40 hover:to-zinc-100/50 dark:hover:from-slate-700/70 dark:hover:via-gray-800/60 dark:hover:to-zinc-800/70 hover:shadow-md hover:shadow-slate-500/10",
      closed:
        "bg-gradient-to-r from-slate-100/80 via-gray-100/70 to-zinc-100/80 dark:from-slate-800/20 dark:via-gray-900/15 dark:to-zinc-900/20",
    },
  },
  {
    id: "community",
    name: communityMeta.title,
    description: communityMeta.tagline,
    paths: ["/(community)/", "/community/"],
    gradients: {
      open: "bg-gradient-to-r from-cyan-200/60 via-teal-200/50 to-blue-200/60 dark:from-cyan-800/90 dark:via-teal-900/80 dark:to-blue-900/90",
      hover:
        "hover:bg-gradient-to-r hover:from-cyan-100/50 hover:via-teal-100/40 hover:to-blue-100/50 dark:hover:from-cyan-700/70 dark:hover:via-teal-800/60 dark:hover:to-blue-800/70 hover:shadow-md hover:shadow-cyan-500/10",
      closed:
        "bg-gradient-to-r from-cyan-100/80 via-teal-100/70 to-blue-100/80 dark:from-cyan-800/20 dark:via-teal-900/15 dark:to-blue-900/20",
    },
  },
  {
    id: "help",
    name: helpMeta.title,
    description: helpMeta.tagline,
    paths: ["/(help)/", "/help/"],
    gradients: {
      open: "bg-gradient-to-r from-red-200/60 via-red-200/50 to-rose-200/60 dark:from-red-800/90 dark:via-red-900/80 dark:to-rose-900/90",
      hover:
        "hover:bg-gradient-to-r hover:from-red-100/50 hover:via-red-100/40 hover:to-rose-100/50 dark:hover:from-red-700/70 dark:hover:via-red-800/60 dark:hover:to-rose-800/70 hover:shadow-md hover:shadow-red-500/10",
      closed:
        "bg-gradient-to-r from-red-100/80 via-red-100/70 to-rose-100/80 dark:from-red-800/20 dark:via-red-900/15 dark:to-rose-900/20",
    },
  },
];

/**
 * Get pillar by ID.
 * @param id Pillar ID.
 * @returns Pillar object or undefined if not found.
 */
export const getPillarById = (id: string): Pillar | undefined => {
  return PILLARS.find((pillar) => pillar.id === id);
};

/**
 * Get pillar by path.
 * @param pathname Current pathname.
 * @returns Pillar object or undefined if not found.
 */
export const getPillarByPath = (pathname: string): Pillar | undefined => {
  // Handle root path specially
  if (pathname === "/" || pathname === "/docs" || pathname === "/docs/") {
    return getPillarById("welcome");
  }

  // Exclude welcome pillar from general search and check other pillars
  const nonWelcomePillars = PILLARS.filter((pillar) => pillar.id !== "welcome");

  // Sort by path specificity (longer paths first)
  const sortedPillars = [...nonWelcomePillars].sort((a, b) => {
    const maxLengthA = Math.max(...a.paths.map((p) => p.length));
    const maxLengthB = Math.max(...b.paths.map((p) => p.length));
    return maxLengthB - maxLengthA;
  });

  return (
    sortedPillars.find((pillar) =>
      pillar.paths.some((path) => {
        // Normalize both pathname and path for comparison
        const normalizedPath = path.replace(/[()]/g, "").replace(/\/+$/, "");
        const normalizedPathname = pathname.replace(/\/+$/, "");

        return (
          normalizedPathname.startsWith(normalizedPath) && normalizedPath !== ""
        );
      }),
    ) || getPillarById("welcome")
  ); // fallback to welcome
};

/**
 * Get all pillar IDs.
 * @returns Array of pillar IDs.
 */
export const getPillarIds = (): string[] => {
  return PILLARS.map((pillar) => pillar.id);
};

/**
 * Get path matching rules for routing.
 * @returns Array of path matching rules.
 */
export const getPathMatchRules = (): [string[], string][] => {
  return PILLARS.map((pillar) => [pillar.paths, pillar.id]);
};
