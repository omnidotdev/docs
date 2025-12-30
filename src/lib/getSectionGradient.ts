import { getRealmById } from "./sections";

/**
 * Get section gradient for each section.
 * @returns the section gradient for the section.
 */
const getSectionGradient = (
  sectionId: string,
  isOpen: boolean,
  isHover = false,
) => {
  const section = getRealmById(sectionId);

  if (!section) {
    // fall back to welcome gradient if section not found
    const welcomeSection = getRealmById("welcome");

    if (!welcomeSection) return "";

    return isOpen
      ? welcomeSection.gradients.open
      : isHover
        ? welcomeSection.gradients.hover
        : welcomeSection.gradients.closed;
  }

  return isOpen
    ? section.gradients.open
    : isHover
      ? section.gradients.hover
      : section.gradients.closed;
};

export default getSectionGradient;
