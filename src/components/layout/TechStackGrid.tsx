import TechStackCard, { TECH_STACK } from "./TechStackCard";

/**
 * Grid of tech stack cards with brand colors.
 * Displays key technologies used in the Omni ecosystem.
 */
const TechStackGrid = () => (
  <div className="not-prose grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {TECH_STACK.map((tech) => (
      <TechStackCard key={tech.id} tech={tech} />
    ))}
  </div>
);

export default TechStackGrid;
