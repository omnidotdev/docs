import { useDrawerActiveItemReveal } from "@/lib/hooks/useSidebarScrollPersistence";

/**
 * Renders nothing; reveals the active item when the mobile sidebar drawer
 * opens. Mount it inside `DocsLayout` so it can read the sidebar context.
 */
const SidebarDrawerReveal = () => {
  useDrawerActiveItemReveal();

  return null;
};

export default SidebarDrawerReveal;
