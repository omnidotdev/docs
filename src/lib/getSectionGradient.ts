import { getPillarById } from "./pillars";

/**
 * Get section gradient for each pillar.
 * @returns The section gradient for the pillar.
 */
const getSectionGradient = (
  sectionId: string,
  isOpen: boolean,
  isHover = false,
) => {
  const pillar = getPillarById(sectionId);

  if (!pillar) {
    // Fallback to welcome gradient if pillar not found
    const welcomePillar = getPillarById("welcome");
    if (!welcomePillar) return "";

    return isOpen
      ? welcomePillar.gradients.open
      : isHover
        ? welcomePillar.gradients.hover
        : welcomePillar.gradients.closed;
  }

  return isOpen
    ? pillar.gradients.open
    : isHover
      ? pillar.gradients.hover
      : pillar.gradients.closed;
};

export default getSectionGradient;
