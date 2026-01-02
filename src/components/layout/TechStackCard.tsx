import {
  SiBiome,
  SiBun,
  SiDocker,
  SiGraphql,
  SiReact,
  SiRust,
  SiTauri,
  SiTypescript,
} from "react-icons/si";

import TiltIcon from "@/components/icons/TiltIcon";
import { cn } from "@/lib/utils";

import type { IconType } from "react-icons";

export interface TechStackItem {
  /** Unique identifier. */
  id: string;
  /** Name. */
  name: string;
  /** URL. */
  href: string;
  /** Purpose of usage; intent. */
  purpose: string;
  /** Reasoning for usage. */
  rationale: string;
  /** Icon. */
  icon: IconType;
  /** Main color. */
  color: string;
  /** Background color. */
  bgColor: string;
  /** Hover border color. */
  hoverBorderColor: string;
}

export const TECH_STACK: TechStackItem[] = [
  {
    id: "typescript",
    name: "TypeScript",
    href: "https://www.typescriptlang.org",
    purpose: "Primary language",
    rationale: "Type safety, expressiveness, rich ecosystem",
    icon: SiTypescript,
    color: "text-[#3178C6]",
    bgColor: "bg-[#3178C6]/10",
    hoverBorderColor: "hover:border-[#3178C6]/50",
  },
  {
    id: "react",
    name: "React",
    href: "https://react.dev",
    purpose: "UI framework",
    rationale: "Component model, community support",
    icon: SiReact,
    color: "text-[#61DAFB]",
    bgColor: "bg-[#61DAFB]/10",
    hoverBorderColor: "hover:border-[#61DAFB]/50",
  },
  {
    id: "rust",
    name: "Rust",
    href: "https://www.rust-lang.org",
    purpose: "Systems & performance",
    rationale: "Memory safety, speed",
    icon: SiRust,
    color: "text-[#CE422B]",
    bgColor: "bg-[#CE422B]/10",
    hoverBorderColor: "hover:border-[#CE422B]/50",
  },
  {
    id: "bun",
    name: "Bun",
    href: "https://bun.sh",
    purpose: "JS runtime & tooling",
    rationale: "Fast installs, unified toolchain",
    icon: SiBun,
    color: "text-[#FBF0DF] dark:text-[#FBF0DF]",
    bgColor: "bg-[#FBF0DF]/10 dark:bg-[#FBF0DF]/5",
    hoverBorderColor: "hover:border-[#FBF0DF]/50",
  },
  {
    id: "tilt",
    name: "Tilt",
    href: "https://tilt.dev",
    purpose: "Dev orchestration",
    rationale: "Language-agnostic, composable, federated",
    icon: TiltIcon,
    color: "text-[#4AB1A6]",
    bgColor: "bg-[#4AB1A6]/10",
    hoverBorderColor: "hover:border-[#4AB1A6]/50",
  },
  {
    id: "graphql",
    name: "GraphQL",
    href: "https://graphql.org",
    purpose: "Query language & API",
    rationale:
      "Efficient data fetching, strong typing, schema-backed, federated",
    icon: SiGraphql,
    color: "text-[#E10098]",
    bgColor: "bg-[#E10098]/10",
    hoverBorderColor: "hover:border-[#E10098]/50",
  },
  {
    id: "tauri",
    name: "Tauri",
    href: "https://tauri.app",
    purpose: "Desktop app framework",
    rationale: "Cross-platform, secure, performant",
    icon: SiTauri,
    color: "text-[#FFC131]",
    bgColor: "bg-[#FFC131]/10",
    hoverBorderColor: "hover:border-[#FFC131]/50",
  },
  {
    id: "docker",
    name: "Docker",
    href: "https://www.docker.com",
    purpose: "Containerization",
    rationale: "Portability, isolation, scalability, idempotency",
    icon: SiDocker,
    color: "text-[#2496ED]",
    bgColor: "bg-[#2496ED]/10",
    hoverBorderColor: "hover:border-[#2496ED]/50",
  },
  {
    id: "biome",
    name: "Biome",
    href: "https://biomejs.dev",
    purpose: "Linting & formatting",
    rationale: "Fast, unified TypeScript tooling",
    icon: SiBiome,
    color: "text-[#60A5FA]",
    bgColor: "bg-[#60A5FA]/10",
    hoverBorderColor: "hover:border-[#60A5FA]/50",
  },
];

interface TechStackCardProps {
  tech: TechStackItem;
}

/**
 * A card component displaying a technology with its icon, name, purpose, and rationale.
 */
const TechStackCard = ({ tech }: TechStackCardProps) => {
  const Icon = tech.icon;

  return (
    <a
      href={tech.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-xl border border-fd-border/50 p-5 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        tech.hoverBorderColor,
      )}
    >
      {/* glow effect */}
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30",
          tech.bgColor,
        )}
      />

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            tech.bgColor,
          )}
        >
          <Icon className={cn("h-5 w-5", tech.color)} />
        </div>
        <div>
          <h3 className="font-bold text-base">{tech.name}</h3>
          <p className={cn("font-medium text-xs", tech.color)}>
            {tech.purpose}
          </p>
        </div>
      </div>

      <p className="text-fd-muted-foreground text-sm">{tech.rationale}</p>
    </a>
  );
};

export default TechStackCard;
