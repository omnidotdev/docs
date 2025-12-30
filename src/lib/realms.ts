import realmsData from "../../realms.json";

export interface Realm {
  /** ID. */
  id: string;
  /** Name. */
  name: string;
  /** Tagline. */
  tagline: string;
  /** Paths. */
  paths: string[];
  /** Primary link. */
  href: string;
  /** Lucide icon name */
  icon: string;
  /** Color gradients. */
  gradients: {
    /** Open color gradient. */
    open: string;
    /** Hover color gradient. */
    hover: string;
    /** Closed color gradient. */
    closed: string;
  };
}

const REALM_GRADIENTS: Record<
  string,
  { open: string; hover: string; closed: string }
> = {
  welcome: {
    open: "bg-gradient-to-r from-emerald-200/60 via-green-200/50 to-teal-200/60 dark:from-emerald-800/90 dark:via-green-900/80 dark:to-teal-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-emerald-100/50 hover:via-green-100/40 hover:to-teal-100/50 dark:hover:from-emerald-700/70 dark:hover:via-green-800/60 dark:hover:to-teal-800/70 hover:shadow-md hover:shadow-emerald-500/10",
    closed:
      "bg-gradient-to-r from-emerald-100/80 via-green-100/70 to-teal-100/80 dark:from-emerald-800/20 dark:via-green-900/15 dark:to-teal-900/20",
  },
  core: {
    open: "bg-gradient-to-r from-blue-200/60 via-blue-200/50 to-indigo-200/60 dark:from-blue-800/90 dark:via-blue-900/80 dark:to-indigo-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-blue-100/50 hover:via-blue-100/40 hover:to-indigo-100/50 dark:hover:from-blue-700/70 dark:hover:via-blue-800/60 dark:hover:to-indigo-800/70 hover:shadow-md hover:shadow-blue-500/10",
    closed:
      "bg-gradient-to-r from-blue-100/80 via-blue-100/70 to-indigo-100/80 dark:from-blue-800/20 dark:via-blue-900/15 dark:to-indigo-900/20",
  },
  kindred: {
    open: "bg-gradient-to-r from-pink-200/60 via-rose-200/50 to-fuchsia-200/60 dark:from-pink-800/90 dark:via-rose-900/80 dark:to-fuchsia-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-pink-100/50 hover:via-rose-100/40 hover:to-fuchsia-100/50 dark:hover:from-pink-700/70 dark:hover:via-rose-800/60 dark:hover:to-fuchsia-800/70 hover:shadow-md hover:shadow-pink-500/10",
    closed:
      "bg-gradient-to-r from-pink-100/80 via-rose-100/70 to-fuchsia-100/80 dark:from-pink-800/20 dark:via-rose-900/15 dark:to-fuchsia-900/20",
  },
  fabric: {
    open: "bg-gradient-to-r from-orange-200/60 via-amber-200/50 to-yellow-200/60 dark:from-orange-800/90 dark:via-amber-900/80 dark:to-yellow-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-orange-100/50 hover:via-amber-100/40 hover:to-yellow-100/50 dark:hover:from-orange-700/70 dark:hover:via-amber-800/60 dark:hover:to-yellow-800/70 hover:shadow-md hover:shadow-orange-500/10",
    closed:
      "bg-gradient-to-r from-orange-100/80 via-amber-100/70 to-yellow-100/80 dark:from-orange-800/20 dark:via-amber-900/15 dark:to-yellow-900/20",
  },
  grid: {
    open: "bg-gradient-to-r from-cyan-200/60 via-sky-200/50 to-blue-200/60 dark:from-cyan-800/90 dark:via-sky-900/80 dark:to-blue-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-cyan-100/50 hover:via-sky-100/40 hover:to-blue-100/50 dark:hover:from-cyan-700/70 dark:hover:via-sky-800/60 dark:hover:to-blue-800/70 hover:shadow-md hover:shadow-cyan-500/10",
    closed:
      "bg-gradient-to-r from-cyan-100/80 via-sky-100/70 to-blue-100/80 dark:from-cyan-800/20 dark:via-sky-900/15 dark:to-blue-900/20",
  },
  armory: {
    open: "bg-gradient-to-r from-slate-200/60 via-gray-200/50 to-zinc-200/60 dark:from-slate-800/90 dark:via-gray-900/80 dark:to-zinc-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-slate-100/50 hover:via-gray-100/40 hover:to-zinc-100/50 dark:hover:from-slate-700/70 dark:hover:via-gray-800/60 dark:hover:to-zinc-800/70 hover:shadow-md hover:shadow-slate-500/10",
    closed:
      "bg-gradient-to-r from-slate-100/80 via-gray-100/70 to-zinc-100/80 dark:from-slate-800/20 dark:via-gray-900/15 dark:to-zinc-900/20",
  },
  codex: {
    open: "bg-gradient-to-r from-sky-200/60 via-blue-200/50 to-indigo-200/60 dark:from-sky-800/90 dark:via-blue-900/80 dark:to-indigo-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-sky-100/50 hover:via-blue-100/40 hover:to-indigo-100/50 dark:hover:from-sky-700/70 dark:hover:via-blue-800/60 dark:hover:to-indigo-800/70 hover:shadow-md hover:shadow-sky-500/10",
    closed:
      "bg-gradient-to-r from-sky-100/80 via-blue-100/70 to-indigo-100/80 dark:from-sky-800/20 dark:via-blue-900/15 dark:to-indigo-900/20",
  },
  sigil: {
    open: "bg-gradient-to-r from-rose-200/60 via-red-200/50 to-pink-200/60 dark:from-rose-800/90 dark:via-red-900/80 dark:to-pink-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-rose-100/50 hover:via-red-100/40 hover:to-pink-100/50 dark:hover:from-rose-700/70 dark:hover:via-red-800/60 dark:hover:to-pink-800/70 hover:shadow-md hover:shadow-rose-500/10",
    closed:
      "bg-gradient-to-r from-rose-100/80 via-red-100/70 to-pink-100/80 dark:from-rose-800/20 dark:via-red-900/15 dark:to-pink-900/20",
  },
  reality: {
    open: "bg-gradient-to-r from-purple-200/60 via-violet-200/50 to-purple-200/60 dark:from-purple-800/90 dark:via-violet-900/80 dark:to-purple-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-purple-100/50 hover:via-violet-100/40 hover:to-purple-100/50 dark:hover:from-purple-700/70 dark:hover:via-violet-800/60 dark:hover:to-purple-800/70 hover:shadow-md hover:shadow-purple-500/10",
    closed:
      "bg-gradient-to-r from-purple-100/80 via-violet-100/70 to-purple-100/80 dark:from-purple-800/20 dark:via-violet-900/15 dark:to-purple-900/20",
  },
  worlds: {
    open: "bg-gradient-to-r from-violet-200/60 via-indigo-200/50 to-purple-200/60 dark:from-violet-800/90 dark:via-indigo-900/80 dark:to-purple-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-violet-100/50 hover:via-indigo-100/40 hover:to-purple-100/50 dark:hover:from-violet-700/70 dark:hover:via-indigo-800/60 dark:hover:to-purple-800/70 hover:shadow-md hover:shadow-violet-500/10",
    closed:
      "bg-gradient-to-r from-violet-100/80 via-indigo-100/70 to-purple-100/80 dark:from-violet-800/20 dark:via-indigo-900/15 dark:to-purple-900/20",
  },
  community: {
    open: "bg-gradient-to-r from-cyan-200/60 via-teal-200/50 to-blue-200/60 dark:from-cyan-800/90 dark:via-teal-900/80 dark:to-blue-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-cyan-100/50 hover:via-teal-100/40 hover:to-blue-100/50 dark:hover:from-cyan-700/70 dark:hover:via-teal-800/60 dark:hover:to-blue-800/70 hover:shadow-md hover:shadow-cyan-500/10",
    closed:
      "bg-gradient-to-r from-cyan-100/80 via-teal-100/70 to-blue-100/80 dark:from-cyan-800/20 dark:via-teal-900/15 dark:to-blue-900/20",
  },
  help: {
    open: "bg-gradient-to-r from-red-200/60 via-red-200/50 to-rose-200/60 dark:from-red-800/90 dark:via-red-900/80 dark:to-rose-900/90",
    hover:
      "hover:bg-gradient-to-r hover:from-red-100/50 hover:via-red-100/40 hover:to-rose-100/50 dark:hover:from-red-700/70 dark:hover:via-red-800/60 dark:hover:to-rose-800/70 hover:shadow-md hover:shadow-red-500/10",
    closed:
      "bg-gradient-to-r from-red-100/80 via-red-100/70 to-rose-100/80 dark:from-red-800/20 dark:via-red-900/15 dark:to-rose-900/20",
  },
};

/**
 * Icon mapping for each realm.
 */
export const REALM_ICONS: Record<string, string> = {
  welcome: "Sparkles",
  core: "Box",
  kindred: "Heart",
  fabric: "Brush",
  grid: "Server",
  armory: "Hammer",
  codex: "FileCode",
  sigil: "Palette",
  reality: "Glasses",
  worlds: "Globe",
  community: "Users",
  help: "HelpCircle",
};

/**
 * Additional, non-realm sections.
 */
const ADDITIONAL_SECTIONS: Realm[] = [
  {
    id: "welcome",
    name: "Welcome",
    tagline: "Open-source ecosystem",
    paths: ["/"],
    href: "/",
    icon: REALM_ICONS.welcome,
    gradients: REALM_GRADIENTS.welcome,
  },
  {
    id: "community",
    name: "Community",
    tagline: "Collaborate with us",
    paths: ["/(community)/", "/community/"],
    href: "/community",
    icon: REALM_ICONS.community,
    gradients: REALM_GRADIENTS.community,
  },
  {
    id: "help",
    name: "Help",
    tagline: "Get help",
    paths: ["/(help)/", "/help/"],
    href: "/help",
    icon: REALM_ICONS.help,
    gradients: REALM_GRADIENTS.help,
  },
];

/**
 * Build realms from `realms.json` (source of truth for product realms).
 */
const buildRealmsFromJson = (): Realm[] => {
  const productRealms: Realm[] = realmsData.realms.map((realm) => ({
    id: realm.id,
    name: realm.name,
    tagline: realm.tagline,
    paths: [`/(${realm.id})/`, `/${realm.id}/`],
    href: realm.docsUrl,
    icon: REALM_ICONS[realm.id] || "Box",
    gradients: REALM_GRADIENTS[realm.id] || REALM_GRADIENTS.welcome,
  }));

  const welcome = ADDITIONAL_SECTIONS.find((s) => s.id === "welcome")!;

  const otherSections = ADDITIONAL_SECTIONS.filter((s) => s.id !== "welcome");

  return [welcome, ...productRealms, ...otherSections];
};

// TODO fetch from Omni API
export const REALMS: Realm[] = buildRealmsFromJson();

/**
 * Get realm by ID.
 * @param id Realm ID.
 * @returns Realm object or undefined if not found.
 */
export const getRealmById = (id: string): Realm | undefined => {
  return REALMS.find((realm) => realm.id === id);
};

/**
 * Get realm by path.
 * @param pathname Current pathname.
 * @returns Realm object or undefined if not found.
 */
export const getRealmByPath = (pathname: string): Realm | undefined => {
  // handle root path specially
  if (pathname === "/" || pathname === "/docs" || pathname === "/docs/")
    return getRealmById("welcome");

  // exclude welcome realm from general search and check other realms
  const nonWelcomeRealms = REALMS.filter((realm) => realm.id !== "welcome");

  // sort by path specificity (longer paths first)
  const sortedRealms = [...nonWelcomeRealms].sort((a, b) => {
    const maxLengthA = Math.max(...a.paths.map((p) => p.length));

    const maxLengthB = Math.max(...b.paths.map((p) => p.length));

    return maxLengthB - maxLengthA;
  });

  return (
    sortedRealms.find(
      (realm) =>
        realm.paths.some((path) => {
          // normalize both pathname and path for comparison
          const normalizedPath = path.replace(/[()]/g, "").replace(/\/+$/, "");
          const normalizedPathname = pathname.replace(/\/+$/, "");

          return (
            normalizedPathname.startsWith(normalizedPath) &&
            normalizedPath !== ""
          );
        }),
      // fall back to welcome
    ) || getRealmById("welcome")
  );
};

/**
 * Get all realm IDs.
 * @returns Array of realm IDs.
 */
export const getRealmIds = (): string[] => {
  return REALMS.map((realm) => realm.id);
};

/**
 * Get path matching rules for routing.
 * @returns Array of path matching rules.
 */
export const getPathMatchRules = (): [string[], string][] => {
  return REALMS.map((realm) => [realm.paths, realm.id]);
};
