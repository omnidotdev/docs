import { Link } from "@tanstack/react-router";
import {
  Box,
  Brush,
  FileCode,
  Glasses,
  Globe,
  Hammer,
  Heart,
  HelpCircle,
  Palette,
  Server,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { Realm } from "@/lib/sections";

/**
 * Hover text colors matching sidebar section colors.
 */
// TODO deduplicate
const REALM_HOVER_TEXT: Record<string, string> = {
  welcome: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
  core: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
  kindred: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
  fabric: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
  grid: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
  armory: "group-hover:text-slate-600 dark:group-hover:text-slate-400",
  codex: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
  sigil: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
  reality: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
  worlds: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
  community: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
  help: "group-hover:text-red-600 dark:group-hover:text-red-400",
};

/** Map of icon names to Lucide components. */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Box,
  Heart,
  Brush,
  Server,
  Glasses,
  Globe,
  Palette,
  FileCode,
  Hammer,
  Users,
  HelpCircle,
};

interface RealmCardProps {
  /** Realm data to display. */
  realm: Realm;
}

/**
 * A card component displaying a realm with its icon, name, tagline, and gradient styling.
 *
 * @param props - Component props.
 * @param props.realm - The realm data to display.
 * @returns A styled link card for navigating to the realm.
 */
const RealmCard = ({ realm }: RealmCardProps) => {
  const Icon = ICON_MAP[realm.icon];

  return (
    <Link
      to={realm.href}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-transparent p-5 transition-all duration-300",
        "hover:scale-[1.02] hover:border-fd-border hover:shadow-lg",
        realm.gradients.closed,
        realm.gradients.hover,
      )}
    >
      {/* gemstone glow effect */}
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50",
          realm.gradients.open,
        )}
      />

      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              realm.gradients.open,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <h3 className="font-bold text-lg">{realm.name}</h3>
      </div>

      <p className="text-fd-muted-foreground text-sm">{realm.tagline}</p>

      <span
        className={cn(
          "mt-auto font-medium text-sm opacity-0 transition-opacity group-hover:opacity-100",
          REALM_HOVER_TEXT[realm.id] || "group-hover:text-fd-primary",
        )}
      >
        Explore →
      </span>
    </Link>
  );
};

export default RealmCard;
