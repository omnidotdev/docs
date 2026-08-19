/**
 * Rewrite a single absolute internal link target through the migration map.
 *
 * A link target may carry a `#anchor` and/or `?query` suffix; those are split
 * off, the bare path is matched against the map by longest key that equals the
 * path or is a path-segment prefix of it, the matched prefix is swapped for its
 * new value, and the suffix is reattached. Unknown paths pass through unchanged.
 */

export type LinkMap = Map<string, string>;

/** Rewrite `target` using `map`; returns it unchanged when nothing matches */
export const rewriteLinkTarget = (target: string, map: LinkMap): string => {
  const suffixIndex = target.search(/[#?]/);
  const path = suffixIndex === -1 ? target : target.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : target.slice(suffixIndex);

  let bestKey: string | null = null;
  for (const key of map.keys()) {
    const isMatch = path === key || path.startsWith(`${key}/`);
    if (isMatch && (bestKey === null || key.length > bestKey.length)) {
      bestKey = key;
    }
  }

  if (bestKey === null) return target;

  const replacement = map.get(bestKey) as string;
  return `${replacement}${path.slice(bestKey.length)}${suffix}`;
};
