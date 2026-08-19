import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { products as catalog } from "@/lib/catalog/generated/catalog";
import { PRODUCT_REALMS } from "@/lib/productRealms.generated";
import { cn } from "@/lib/utils";
import realmsData from "../../../realms.json";

interface ProductEntry {
  /** Product id (URL slug). */
  id: string;
  /** Display name. */
  name: string;
  /** Realm id. */
  realm: string;
  /** Canonical docs URL. */
  url: string;
}

/** Title case a product id as a display-name fallback. */
const titleCase = (id: string): string =>
  id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/** Every public product that has docs, enriched from the omni-api catalog. */
const ENTRIES: ProductEntry[] = Object.entries(PRODUCT_REALMS)
  .map(([id, realm]) => ({
    id,
    realm,
    name: catalog.find((product) => product.id === id)?.name ?? titleCase(id),
    url: `/products/${id}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Realms that actually have at least one product, in realms.json order. */
const REALM_FILTERS = realmsData.realms.filter((realm) =>
  ENTRIES.some((entry) => entry.realm === realm.id),
);

/**
 * Searchable, realm-filterable index of every product with documentation.
 *
 * Reads only committed public data (the generated product to realm map plus the
 * omni-api catalog), so unlaunched private products never appear and every card
 * links to a real page.
 */
const ProductsIndex: React.FC = () => {
  const [query, setQuery] = useState("");
  const [realm, setRealm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return ENTRIES.filter((entry) => {
      if (realm && entry.realm !== realm) return false;
      if (!needle) return true;

      return (
        entry.name.toLowerCase().includes(needle) ||
        entry.id.toLowerCase().includes(needle)
      );
    });
  }, [query, realm]);

  return (
    <div className="not-prose flex flex-col gap-4">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRealm(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            realm === null
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent",
          )}
        >
          All
        </button>

        {REALM_FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setRealm(option.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              realm === option.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent",
            )}
          >
            {option.icon} {option.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <a
            key={entry.id}
            href={entry.url}
            className="flex flex-col gap-2 rounded-xl border p-4 transition-colors hover:bg-accent"
          >
            <span className="font-medium">{entry.name}</span>
            <Badge variant="secondary" className="self-start uppercase">
              {entry.realm}
            </Badge>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-sm">No products match.</p>
      )}
    </div>
  );
};

export default ProductsIndex;
