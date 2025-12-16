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
    name: "Welcome to Omni",
    description: "Open-source ecosystem",
    paths: ["/"],
    gradients: {
      open: "bg-gradient-to-r from-emerald-800/90 via-green-900/80 to-teal-900/90 text-white",
      hover:
        "hover:bg-gradient-to-r hover:from-emerald-700/70 hover:via-green-800/60 hover:to-teal-800/70 hover:text-white hover:shadow-md hover:shadow-emerald-500/10",
      closed:
        "bg-gradient-to-r from-emerald-800/20 via-green-900/15 to-teal-900/20",
    },
  },
  {
    id: "core",
    name: "Omni Core",
    description: "Omni products",
    paths: ["/(core)/", "/core/"],
    gradients: {
      open: "bg-gradient-to-r from-blue-800/90 via-blue-900/80 to-indigo-900/90 text-white",
      hover:
        "hover:bg-gradient-to-r hover:from-blue-700/70 hover:via-blue-800/60 hover:to-indigo-800/70 hover:text-white hover:shadow-md hover:shadow-blue-500/10",
      closed:
        "bg-gradient-to-r from-blue-800/20 via-blue-900/15 to-indigo-900/20",
    },
  },
  {
    id: "reality",
    name: "Omni Reality",
    description: "Spatial computing",
    paths: ["/(reality)/", "/reality/"],
    gradients: {
      open: "bg-gradient-to-r from-purple-800/90 via-violet-900/80 to-purple-900/90 text-white",
      hover:
        "hover:bg-gradient-to-r hover:from-purple-700/70 hover:via-violet-800/60 hover:to-purple-800/70 hover:text-white hover:shadow-md hover:shadow-purple-500/10",
      closed:
        "bg-gradient-to-r from-purple-800/20 via-violet-900/15 to-purple-900/20",
    },
  },
  {
    id: "sigil",
    name: "Omni Sigil",
    description: "Omni design system",
    paths: ["/(sigil)/", "/sigil/"],
    gradients: {
      open: "bg-gradient-to-r from-rose-800/90 via-red-900/80 to-pink-900/90 text-white",
      hover:
        "hover:bg-gradient-to-r hover:from-rose-700/70 hover:via-red-800/60 hover:to-pink-800/70 hover:text-white hover:shadow-md hover:shadow-rose-500/10",
      closed: "bg-gradient-to-r from-rose-800/20 via-red-900/15 to-pink-900/20",
    },
  },
  {
    id: "blueprint",
    name: "Omni Blueprint",
    description: "Specifications & standards",
    paths: ["/(specs-standards)/", "/blueprint/"],
    gradients: {
      open: "bg-gradient-to-r from-amber-800/90 via-yellow-900/80 to-orange-900/90 text-white",
      hover:
        "hover:bg-gradient-to-r hover:from-amber-700/70 hover:via-yellow-800/60 hover:to-orange-800/70 hover:text-white hover:shadow-md hover:shadow-amber-500/10",
      closed:
        "bg-gradient-to-r from-amber-800/20 via-yellow-900/15 to-orange-900/20",
    },
  },
  {
    id: "forge",
    name: "Omni Forge",
    description: "Tools for tinkerers",
    paths: ["/(forge)/", "/forge/"],
    gradients: {
      open: "bg-gradient-to-r from-slate-800/90 via-gray-900/80 to-zinc-900/90 text-white",
      hover:
        "hover:bg-gradient-to-r hover:from-slate-700/70 hover:via-gray-800/60 hover:to-zinc-800/70 hover:text-white hover:shadow-md hover:shadow-slate-500/10",
      closed:
        "bg-gradient-to-r from-slate-800/20 via-gray-900/15 to-zinc-900/20",
    },
  },
  {
    id: "community",
    name: "Community",
    description: "Collaborate with us",
    paths: ["/(community)/", "/community/"],
    gradients: {
      open: "bg-gradient-to-r from-cyan-800/90 via-teal-900/80 to-blue-900/90 text-white",
      hover:
        "hover:bg-gradient-to-r hover:from-cyan-700/70 hover:via-teal-800/60 hover:to-blue-800/70 hover:text-white hover:shadow-md hover:shadow-cyan-500/10",
      closed:
        "bg-gradient-to-r from-cyan-800/20 via-teal-900/15 to-blue-900/20",
    },
  },
  {
    id: "help",
    name: "Help",
    description: "Get help",
    paths: ["/(help)/", "/help/"],
    gradients: {
      open: "bg-gradient-to-r from-red-800/90 via-red-900/80 to-rose-900/90 text-white",
      hover:
        "hover:bg-gradient-to-r hover:from-red-700/70 hover:via-red-800/60 hover:to-rose-800/70 hover:text-white hover:shadow-md hover:shadow-red-500/10",
      closed: "bg-gradient-to-r from-red-800/20 via-red-900/15 to-rose-900/20",
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
  return PILLARS.find((pillar) =>
    pillar.paths.some((path) => pathname.includes(path)),
  );
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
