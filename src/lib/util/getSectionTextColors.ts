import { getPillarById } from "../pillars";

/**
 * Get section text colors for title and description based on state.
 * @param sectionId section identifier
 * @param isOpen whether section is open
 * @param isHover whether section is being hovered
 * @returns object with title and description color classes
 */
const getSectionTextColors = (
  sectionId: string,
  isOpen: boolean,
  isHover = false,
) => {
  const pillar = getPillarById(sectionId);

  if (!pillar) {
    // fallback to welcome colors if pillar not found
    const welcomePillar = getPillarById("welcome");
    if (!welcomePillar)
      return {
        title: "",
        description: "",
      };

    return getSectionTextColors("welcome", isOpen, isHover);
  }

  // Define color mappings for each pillar
  const colorMappings = {
    welcome: {
      title: {
        open: "text-emerald-800 dark:text-white",
        hover: "group-hover:text-emerald-700 dark:group-hover:text-emerald-200",
        closed: "",
      },
      description: {
        open: "text-emerald-700 dark:text-emerald-200",
        hover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-300",
        closed:
          "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
      },
    },
    core: {
      title: {
        open: "text-blue-800 dark:text-white",
        hover: "group-hover:text-blue-700 dark:group-hover:text-blue-200",
        closed: "",
      },
      description: {
        open: "text-blue-700 dark:text-blue-200",
        hover: "group-hover:text-blue-600 dark:group-hover:text-blue-300",
        closed: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
      },
    },
    reality: {
      title: {
        open: "text-purple-800 dark:text-white",
        hover: "group-hover:text-purple-700 dark:group-hover:text-purple-200",
        closed: "",
      },
      description: {
        open: "text-purple-700 dark:text-purple-200",
        hover: "group-hover:text-purple-600 dark:group-hover:text-purple-300",
        closed: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
      },
    },
    sigil: {
      title: {
        open: "text-rose-800 dark:text-white",
        hover: "group-hover:text-rose-700 dark:group-hover:text-rose-200",
        closed: "",
      },
      description: {
        open: "text-rose-700 dark:text-rose-200",
        hover: "group-hover:text-rose-600 dark:group-hover:text-rose-300",
        closed: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
      },
    },
    blueprint: {
      title: {
        open: "text-amber-800 dark:text-white",
        hover: "group-hover:text-amber-700 dark:group-hover:text-amber-200",
        closed: "",
      },
      description: {
        open: "text-amber-700 dark:text-amber-200",
        hover: "group-hover:text-amber-600 dark:group-hover:text-amber-300",
        closed: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
      },
    },
    forge: {
      title: {
        open: "text-slate-800 dark:text-white",
        hover: "group-hover:text-slate-700 dark:group-hover:text-slate-200",
        closed: "",
      },
      description: {
        open: "text-slate-700 dark:text-slate-200",
        hover: "group-hover:text-slate-600 dark:group-hover:text-slate-300",
        closed: "group-hover:text-slate-600 dark:group-hover:text-slate-400",
      },
    },
    community: {
      title: {
        open: "text-cyan-800 dark:text-white",
        hover: "group-hover:text-cyan-700 dark:group-hover:text-cyan-200",
        closed: "",
      },
      description: {
        open: "text-cyan-700 dark:text-cyan-200",
        hover: "group-hover:text-cyan-600 dark:group-hover:text-cyan-300",
        closed: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
      },
    },
    help: {
      title: {
        open: "text-red-800 dark:text-white",
        hover: "group-hover:text-red-700 dark:group-hover:text-red-200",
        closed: "",
      },
      description: {
        open: "text-red-700 dark:text-red-200",
        hover: "group-hover:text-red-600 dark:group-hover:text-red-300",
        closed: "group-hover:text-red-600 dark:group-hover:text-red-400",
      },
    },
  };

  const colors = colorMappings[sectionId as keyof typeof colorMappings];

  if (!colors) return getSectionTextColors("welcome", isOpen, isHover);

  if (isOpen)
    return {
      title: colors.title.open,
      description: colors.description.open,
    };

  return {
    title: colors.title.hover,
    description: `${colors.description.closed} ${colors.description.hover}`,
  };
};

export default getSectionTextColors;
