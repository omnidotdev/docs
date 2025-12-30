import { REALMS } from "@/lib/realms";
import RealmCard from "./RealmCard";

interface RealmGridProps {
  /** Exclude certain realms by ID. */
  exclude?: string[];
}

/**
 * Grid of realm cards with gemstone styling.
 * Displays all realms in the Omni ecosystem, excluding specified realms.
 *
 * @param props component props.
 * @param props.exclude array of realm IDs to exclude from the grid.
 * @returns a responsive grid of RealmCard components.
 */
const RealmGrid = ({ exclude = ["welcome"] }: RealmGridProps) => {
  const realms = REALMS.filter((r) => !exclude.includes(r.id));

  return (
    <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {realms.map((realm) => (
        <RealmCard key={realm.id} realm={realm} />
      ))}
    </div>
  );
};

export default RealmGrid;
