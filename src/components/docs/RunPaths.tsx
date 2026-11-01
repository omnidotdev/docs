import FumadocsLink from "fumadocs-core/link";
import { FaArrowRight, FaCheck, FaCode, FaRocket } from "react-icons/fa6";

import TiltIcon from "@/components/icons/TiltIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

/** Literal class sets per brand color, kept whole so Tailwind's JIT keeps them */
interface Accent {
  text: string;
  term: string;
  iconBg: string;
  border: string;
  ring: string;
  badgeBg: string;
  badgeText: string;
  bannerBg: string;
  bannerBorder: string;
  bannerHover: string;
}

const ACCENTS = {
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    term: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    border: "border-emerald-500/50",
    ring: "ring-emerald-500/20",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    bannerBg: "bg-emerald-500/5",
    bannerBorder: "border-emerald-500/20",
    bannerHover: "hover:bg-emerald-500/10",
  },
  yellow: {
    text: "text-yellow-600 dark:text-yellow-400",
    term: "text-yellow-400",
    iconBg: "bg-yellow-500/10",
    border: "border-yellow-500/50",
    ring: "ring-yellow-500/20",
    badgeBg: "bg-yellow-100 dark:bg-yellow-900",
    badgeText: "text-yellow-700 dark:text-yellow-300",
    bannerBg: "bg-yellow-500/5",
    bannerBorder: "border-yellow-500/20",
    bannerHover: "hover:bg-yellow-500/10",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    term: "text-amber-400",
    iconBg: "bg-amber-500/10",
    border: "border-amber-500/50",
    ring: "ring-amber-500/20",
    badgeBg: "bg-amber-100 dark:bg-amber-900",
    badgeText: "text-amber-700 dark:text-amber-300",
    bannerBg: "bg-amber-500/5",
    bannerBorder: "border-amber-500/20",
    bannerHover: "hover:bg-amber-500/10",
  },
  orange: {
    text: "text-orange-600 dark:text-orange-400",
    term: "text-orange-400",
    iconBg: "bg-orange-500/10",
    border: "border-orange-500/50",
    ring: "ring-orange-500/20",
    badgeBg: "bg-orange-100 dark:bg-orange-900",
    badgeText: "text-orange-700 dark:text-orange-300",
    bannerBg: "bg-orange-500/5",
    bannerBorder: "border-orange-500/20",
    bannerHover: "hover:bg-orange-500/10",
  },
  red: {
    text: "text-red-600 dark:text-red-400",
    term: "text-red-400",
    iconBg: "bg-red-500/10",
    border: "border-red-500/50",
    ring: "ring-red-500/20",
    badgeBg: "bg-red-100 dark:bg-red-900",
    badgeText: "text-red-700 dark:text-red-300",
    bannerBg: "bg-red-500/5",
    bannerBorder: "border-red-500/20",
    bannerHover: "hover:bg-red-500/10",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400",
    term: "text-rose-400",
    iconBg: "bg-rose-500/10",
    border: "border-rose-500/50",
    ring: "ring-rose-500/20",
    badgeBg: "bg-rose-100 dark:bg-rose-900",
    badgeText: "text-rose-700 dark:text-rose-300",
    bannerBg: "bg-rose-500/5",
    bannerBorder: "border-rose-500/20",
    bannerHover: "hover:bg-rose-500/10",
  },
  pink: {
    text: "text-pink-600 dark:text-pink-400",
    term: "text-pink-400",
    iconBg: "bg-pink-500/10",
    border: "border-pink-500/50",
    ring: "ring-pink-500/20",
    badgeBg: "bg-pink-100 dark:bg-pink-900",
    badgeText: "text-pink-700 dark:text-pink-300",
    bannerBg: "bg-pink-500/5",
    bannerBorder: "border-pink-500/20",
    bannerHover: "hover:bg-pink-500/10",
  },
  purple: {
    text: "text-purple-600 dark:text-purple-400",
    term: "text-purple-400",
    iconBg: "bg-purple-500/10",
    border: "border-purple-500/50",
    ring: "ring-purple-500/20",
    badgeBg: "bg-purple-100 dark:bg-purple-900",
    badgeText: "text-purple-700 dark:text-purple-300",
    bannerBg: "bg-purple-500/5",
    bannerBorder: "border-purple-500/20",
    bannerHover: "hover:bg-purple-500/10",
  },
  violet: {
    text: "text-violet-600 dark:text-violet-400",
    term: "text-violet-400",
    iconBg: "bg-violet-500/10",
    border: "border-violet-500/50",
    ring: "ring-violet-500/20",
    badgeBg: "bg-violet-100 dark:bg-violet-900",
    badgeText: "text-violet-700 dark:text-violet-300",
    bannerBg: "bg-violet-500/5",
    bannerBorder: "border-violet-500/20",
    bannerHover: "hover:bg-violet-500/10",
  },
  indigo: {
    text: "text-indigo-600 dark:text-indigo-400",
    term: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    border: "border-indigo-500/50",
    ring: "ring-indigo-500/20",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    bannerBg: "bg-indigo-500/5",
    bannerBorder: "border-indigo-500/20",
    bannerHover: "hover:bg-indigo-500/10",
  },
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    term: "text-blue-400",
    iconBg: "bg-blue-500/10",
    border: "border-blue-500/50",
    ring: "ring-blue-500/20",
    badgeBg: "bg-blue-100 dark:bg-blue-900",
    badgeText: "text-blue-700 dark:text-blue-300",
    bannerBg: "bg-blue-500/5",
    bannerBorder: "border-blue-500/20",
    bannerHover: "hover:bg-blue-500/10",
  },
  sky: {
    text: "text-sky-600 dark:text-sky-400",
    term: "text-sky-400",
    iconBg: "bg-sky-500/10",
    border: "border-sky-500/50",
    ring: "ring-sky-500/20",
    badgeBg: "bg-sky-100 dark:bg-sky-900",
    badgeText: "text-sky-700 dark:text-sky-300",
    bannerBg: "bg-sky-500/5",
    bannerBorder: "border-sky-500/20",
    bannerHover: "hover:bg-sky-500/10",
  },
  cyan: {
    text: "text-cyan-600 dark:text-cyan-400",
    term: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    border: "border-cyan-500/50",
    ring: "ring-cyan-500/20",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    bannerBg: "bg-cyan-500/5",
    bannerBorder: "border-cyan-500/20",
    bannerHover: "hover:bg-cyan-500/10",
  },
  teal: {
    text: "text-teal-600 dark:text-teal-400",
    term: "text-teal-400",
    iconBg: "bg-teal-500/10",
    border: "border-teal-500/50",
    ring: "ring-teal-500/20",
    badgeBg: "bg-teal-100 dark:bg-teal-900",
    badgeText: "text-teal-700 dark:text-teal-300",
    bannerBg: "bg-teal-500/5",
    bannerBorder: "border-teal-500/20",
    bannerHover: "hover:bg-teal-500/10",
  },
  green: {
    text: "text-green-600 dark:text-green-400",
    term: "text-green-400",
    iconBg: "bg-green-500/10",
    border: "border-green-500/50",
    ring: "ring-green-500/20",
    badgeBg: "bg-green-100 dark:bg-green-900",
    badgeText: "text-green-700 dark:text-green-300",
    bannerBg: "bg-green-500/5",
    bannerBorder: "border-green-500/20",
    bannerHover: "hover:bg-green-500/10",
  },
} satisfies Record<string, Accent>;

export type AccentName = keyof typeof ACCENTS;

export interface RunPathsProps {
  /** Display name of the app, e.g. "Runa" */
  appName?: string;
  /** Catalog slug used for `run up <slug>` */
  slug?: string;
  /** Stack repo cloned for the development path */
  repo?: string;
  /** Brand color for the section; defaults to run's emerald */
  accent?: AccentName;
  /** Link to the self-hosting guide */
  selfHostHref?: string;
  /** Link to the contributing/development guide */
  contributeHref?: string;
  /** Link to the full install matrix (Homebrew, AUR, binaries, source) */
  installHref?: string;
  /** Render the unified-docs banner below the cards */
  showDocsBanner?: boolean;
}

interface TermLine {
  /** Leading token rendered in the accent color (prompt, status, or empty) */
  lead?: string;
  /** Line body */
  text: ReactNode;
  /** Comment line, rendered muted */
  comment?: boolean;
}

interface PathCardProps {
  recommended?: boolean;
  icon: ReactNode;
  iconColor: string;
  iconBg: string;
  checkColor: string;
  accent: Accent;
  title: string;
  best: string;
  description: string;
  termName: string;
  lines: TermLine[];
  features: string[];
  note: ReactNode;
  cta: { label: string; href: string };
}

/** Faux terminal block shared by both paths */
const Terminal = ({
  name,
  lines,
  lead,
}: {
  name: string;
  lines: TermLine[];
  lead: string;
}) => (
  <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
    <div className="flex items-center gap-1.5 border-zinc-800 border-b px-3 py-2">
      <span className="size-2.5 rounded-full bg-red-500" />
      <span className="size-2.5 rounded-full bg-yellow-500" />
      <span className="size-2.5 rounded-full bg-green-500" />
      <span className="ml-1.5 font-mono text-xs text-zinc-400">{name}</span>
    </div>

    <div className="whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs text-zinc-200 leading-relaxed sm:text-[13px]">
      {lines.map((line, index) => {
        if (line.comment)
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: static transcript
            <div key={index} className="text-zinc-500">
              {line.text}
            </div>
          );

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: static transcript
          <div key={index}>
            {line.lead ? <span className={lead}>{line.lead} </span> : null}
            {line.text}
          </div>
        );
      })}
    </div>
  </div>
);

/** One of the two run paths */
const PathCard = ({
  recommended,
  icon,
  iconColor,
  iconBg,
  checkColor,
  accent,
  title,
  best,
  description,
  termName,
  lines,
  features,
  note,
  cta,
}: PathCardProps) => (
  <div
    className={cn(
      "relative flex flex-col rounded-xl border p-5 sm:p-6",
      recommended
        ? cn(accent.border, "ring-1", accent.ring)
        : "border-fd-border/60",
    )}
  >
    {recommended ? (
      <span
        className={cn(
          "absolute -top-2.5 left-6 z-10 rounded-full px-2.5 py-0.5 font-medium font-mono text-[11px] uppercase tracking-wide",
          accent.badgeBg,
          accent.badgeText,
        )}
      >
        Recommended
      </span>
    ) : null}

    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-lg",
          iconBg,
        )}
      >
        <span className={cn("[&_svg]:size-5", iconColor)}>{icon}</span>
      </div>
      <div>
        <h3 className="font-bold text-base text-fd-foreground">{title}</h3>
        <p className="text-fd-muted-foreground text-xs">{best}</p>
      </div>
    </div>

    <p className="mt-3 mb-4 text-fd-muted-foreground text-sm">{description}</p>

    <Terminal name={termName} lines={lines} lead={accent.term} />

    <ul className="mt-4 flex flex-col gap-2">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm">
          <FaCheck className={cn("mt-0.5 size-3.5 shrink-0", checkColor)} />
          <span className="text-fd-foreground">{feature}</span>
        </li>
      ))}
    </ul>

    <p className="mt-4 rounded-lg border border-fd-border/60 border-dashed bg-fd-muted/40 px-3 py-2.5 text-fd-muted-foreground text-xs">
      {note}
    </p>

    <div className="mt-auto pt-5">
      <Button
        asChild
        size="sm"
        variant={recommended ? "default" : "outline"}
        className="cursor-pointer"
      >
        <FumadocsLink href={cta.href}>
          {cta.label}
          <FaArrowRight />
        </FumadocsLink>
      </Button>
    </div>
  </div>
);

/**
 * Two first-class ways to run an Omni app: self-host the real stack with the
 * `run` CLI (the default path) or spin up the full source with Tilt to develop.
 * Parameterized per product and reusable across docs pages; `accent` brands the
 * section to the product's color.
 */
const RunPaths = ({
  appName = "your app",
  slug = "runa",
  repo,
  accent = "emerald",
  selfHostHref = "/products/run",
  contributeHref = "/community/contributing",
  installHref = "/products/run#installation",
  showDocsBanner = true,
}: RunPathsProps) => {
  const a = ACCENTS[accent] ?? ACCENTS.emerald;
  const stackRepo = repo ?? `git@github.com:omnidotdev/${slug}-stack`;
  const stackDir = stackRepo.split("/").pop() ?? `${slug}-stack`;

  return (
    <div className="not-prose my-6">
      <div className="grid gap-4 md:grid-cols-2">
        <PathCard
          recommended
          icon={<FaRocket />}
          iconColor={a.text}
          iconBg={a.iconBg}
          checkColor={a.text}
          accent={a}
          title="Self-host with run"
          best="For running the app for real"
          description="One command brings up the full stack with automatic SSL, reverse proxy, secrets, and health checks."
          termName="run"
          lines={[
            { comment: true, text: "# install run once (macOS / Linux)" },
            { text: "curl -fsSL https://run.omni.dev/install.sh | sh" },
            { text: " " },
            { comment: true, text: "# bring up the full stack" },
            { lead: "$", text: `run up ${slug}` },
            {
              lead: "[ok]",
              text: (
                <>
                  {appName} is running at{" "}
                  <span className={cn("font-semibold", a.term)}>
                    https://localhost
                  </span>
                </>
              ),
            },
          ]}
          features={[
            "One command, whole stack running",
            "Trusted local HTTPS via mkcert",
            "Snapshots and one-command rollback",
          ]}
          note={
            <>
              Going to production?{" "}
              <code className={cn("font-mono", a.text)}>run deploy {slug}</code>{" "}
              emits a <code className="font-mono">fractal.yaml</code> to push
              the same stack to the cloud.
            </>
          }
          cta={{ label: "Self-hosting guide", href: selfHostHref }}
        />

        <PathCard
          icon={<TiltIcon />}
          iconColor="text-[#4AB1A6]"
          iconBg="bg-[#4AB1A6]/10"
          checkColor={a.text}
          accent={a}
          title="Develop with Tilt"
          best="For hacking on the source"
          description="Clone the stack and orchestrate every service with live reload. Tilt wires them up for you."
          termName="tilt"
          lines={[
            { lead: "$", text: `git clone ${stackRepo}` },
            { lead: "$", text: `cd ${stackDir}` },
            { lead: "$", text: "tilt up" },
            {
              lead: "[ok]",
              text: (
                <>
                  services live at{" "}
                  <span className={cn("font-semibold", a.term)}>
                    localhost:10350
                  </span>
                </>
              ),
            },
          ]}
          features={[
            "Live reload across every service",
            "Source mounted, debugger-ready",
            "Auto-discovers each service Tiltfile",
          ]}
          note={
            <>
              The stack&apos;s <code className="font-mono">Tiltfile</code>{" "}
              clones and starts each service; edit the source and changes reload
              in place.
            </>
          }
          cta={{ label: "Contributing guide", href: contributeHref }}
        />
      </div>

      <p className="mt-4 text-fd-muted-foreground text-xs">
        <span className="font-semibold text-fd-foreground">Prerequisites:</span>{" "}
        Docker with the Compose plugin
        <span className="mx-2 text-fd-border">&middot;</span>
        mkcert{" "}
        <span className="italic">(optional, for trusted local HTTPS)</span>
      </p>

      <p className="mt-2 text-fd-muted-foreground text-xs">
        Prefer Homebrew, the AUR, a prebuilt binary, or building from source?{" "}
        <FumadocsLink
          href={installHref}
          className={cn("font-medium hover:underline", a.text)}
        >
          See all install methods
        </FumadocsLink>
        .
      </p>

      {showDocsBanner ? (
        <FumadocsLink
          href="/products/run"
          className={cn(
            "mt-4 flex items-center justify-between gap-3 rounded-xl border px-5 py-4 no-underline transition-colors",
            a.bannerBg,
            a.bannerBorder,
            a.bannerHover,
          )}
        >
          <span className="flex items-center gap-3">
            <FaCode className={cn("size-5 shrink-0", a.text)} />
            <span className="flex flex-col">
              <span className="font-semibold text-fd-foreground text-sm">
                One home for everything
              </span>
              <span className="text-fd-muted-foreground text-xs">
                Install, the app catalog, recipes, backups, and cloud deploys.
              </span>
            </span>
          </span>
          <span
            className={cn(
              "hidden shrink-0 font-mono text-sm sm:inline",
              a.text,
            )}
          >
            docs.omni.dev/products/run &rarr;
          </span>
        </FumadocsLink>
      ) : null}
    </div>
  );
};

export default RunPaths;
