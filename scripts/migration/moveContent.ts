/**
 * Compute (and optionally execute) the Phase 2 content-move plan.
 *
 * Reads scripts/migration/data/classification.json and derives, for every one
 * of the 267 live docs URLs, a single action:
 *   - product | realm-hub | realm-page  -> MOVE file to its new /products or
 *     /realms path (Fumadocs content root is content/docs)
 *   - redirect-only (the grid/mimic duplicate) -> REMOVE (its URL is handled by
 *     the redirect map)
 *   - exclude under carbon|ember|quantum   -> MOVE OUT to content/_unlaunched
 *     (preserves the draft, removes it from the served tree)
 *   - exclude vault scaffold                -> REMOVE
 *   - ecosystem                             -> leave in place (no action)
 *
 * New file path for a moved page:
 *   content/docs + <to> + (original file ended with /index.mdx ? /index.mdx : .mdx)
 *
 * Run with `--execute` to perform the moves via git mv / git rm (tracked) or
 * plain mv / rm (untracked); without it the plan is printed and asserted only.
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

type Kind =
  | "product"
  | "realm-hub"
  | "realm-page"
  | "ecosystem"
  | "exclude"
  | "redirect-only";

interface Entry {
  url: string;
  file: string;
  kind: Kind;
  to: string | null;
}

type ActionType = "move" | "unlaunched" | "remove" | "leave";

interface Action {
  type: ActionType;
  from: string;
  to?: string;
  kind: Kind;
}

const repoRoot = resolve(import.meta.dir, "../..");
const classification: Entry[] = JSON.parse(
  await Bun.file(
    join(repoRoot, "scripts/migration/data/classification.json"),
  ).text(),
);

const CONTENT_PREFIX = "content/docs/";

/** Derive the new served path for a moved page from its `to` URL and origin */
const movedPath = (entry: Entry): string => {
  const isIndex = entry.file.endsWith("/index.mdx");
  return `content/docs${entry.to}${isIndex ? "/index.mdx" : ".mdx"}`;
};

const isUnlaunched = (file: string): boolean =>
  file.startsWith("content/docs/carbon/") ||
  file.startsWith("content/docs/ember/") ||
  file.startsWith("content/docs/quantum/");

const planAction = (entry: Entry): Action => {
  switch (entry.kind) {
    case "product":
    case "realm-hub":
    case "realm-page":
      return {
        type: "move",
        from: entry.file,
        to: movedPath(entry),
        kind: entry.kind,
      };
    case "redirect-only":
      return { type: "remove", from: entry.file, kind: entry.kind };
    case "exclude":
      if (isUnlaunched(entry.file)) {
        return {
          type: "unlaunched",
          from: entry.file,
          to: `content/_unlaunched/${entry.file.slice(CONTENT_PREFIX.length)}`,
          kind: entry.kind,
        };
      }
      return { type: "remove", from: entry.file, kind: entry.kind };
    case "ecosystem":
      return { type: "leave", from: entry.file, kind: entry.kind };
  }
};

const actions = classification.map(planAction);

// Assertion: no two destinations collide
const destinations = new Map<string, string[]>();
for (const a of actions) {
  if (a.type === "move" || a.type === "unlaunched") {
    const list = destinations.get(a.to as string) ?? [];
    list.push(a.from);
    destinations.set(a.to as string, list);
  }
}
const collisions = [...destinations.entries()].filter(
  ([, sources]) => sources.length > 1,
);

const counts = {
  moves: actions.filter((a) => a.type === "move").length,
  removes: actions.filter((a) => a.type === "remove").length,
  unlaunched: actions.filter((a) => a.type === "unlaunched").length,
  ecosystem: actions.filter((a) => a.type === "leave").length,
};
const actioned =
  counts.moves + counts.removes + counts.unlaunched + counts.ecosystem;

console.info("=== Phase 2 move plan ===");
console.info(counts);
console.info("total actioned:", actioned, "/ expected 267");

if (collisions.length > 0) {
  console.error("COLLISIONS DETECTED:");
  for (const [dest, sources] of collisions) {
    console.error(`  ${dest} <= ${sources.join(", ")}`);
  }
  process.exit(1);
}
console.info("collisions: none");

if (actioned !== 267) {
  console.error(`ABORT: actioned ${actioned} != 267`);
  process.exit(1);
}

const isTracked = (file: string): boolean => {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", file], {
      cwd: repoRoot,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
};

const gitMv = (from: string, to: string) => {
  mkdirSync(dirname(join(repoRoot, to)), { recursive: true });
  if (isTracked(from)) {
    execFileSync("git", ["mv", from, to], { cwd: repoRoot, stdio: "pipe" });
  } else {
    renameSync(join(repoRoot, from), join(repoRoot, to));
  }
};

const remove = (file: string) => {
  if (isTracked(file)) {
    execFileSync("git", ["rm", "--quiet", file], {
      cwd: repoRoot,
      stdio: "pipe",
    });
  } else {
    rmSync(join(repoRoot, file));
  }
};

const execute = process.argv.includes("--execute");
if (!execute) {
  console.info("\n(dry run) pass --execute to perform the moves");
  process.exit(0);
}

console.info("\n=== executing ===");
for (const a of actions) {
  if (a.type === "move" || a.type === "unlaunched") {
    gitMv(a.from, a.to as string);
  } else if (a.type === "remove") {
    remove(a.from);
  }
}

// Prune now-empty former realm directories (that held only moved product files)
const formerRealmDirs = [
  "armory",
  "core",
  "fabric",
  "grid",
  "kindred",
  "codex",
  "reality",
  "sigil",
  "worlds",
  "carbon",
  "ember",
  "quantum",
  "vault",
];
for (const d of formerRealmDirs) {
  const abs = join(repoRoot, "content/docs", d);
  // recurse subdirs first, removing any that become empty
  const recurse = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) recurse(join(dir, ent.name));
    }
    if (existsSync(dir) && readdirSync(dir).length === 0) {
      rmSync(dir, { recursive: true, force: true });
      console.info("pruned empty dir:", dir.slice(repoRoot.length + 1));
    }
  };
  recurse(abs);
}

console.info("\ndone");
