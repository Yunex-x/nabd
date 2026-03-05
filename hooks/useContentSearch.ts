import { NormalizedContentItem } from "@/types";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

export type ContentFiltersType = {
  favoritesOnly: boolean;
  shortOnly: boolean;
  sleepOnly: boolean;
};

export function useContentSearch(items: NormalizedContentItem[]) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ContentFiltersType>({
    favoritesOnly: false,
    shortOnly: false,
    sleepOnly: false,
  });

  const debouncedQuery = useDebouncedValue(query, 300);

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    return items.filter((it) => {
      // Filter: favorites
      if (filters.favoritesOnly && !it.favorite) return false;

      // Filter: short adhkar
      if (filters.shortOnly) {
        const len = it.text?.length ?? 0;
        if (len >= 120) return false;
      }

      // Filter: sleep adhkar
      if (filters.sleepOnly) {
        const tags = (it.tags || []).map((t) => t.toLowerCase());
        const section = (it.section || "").toLowerCase();
        if (!tags.includes("sleep") && !section.includes("sleep")) return false;
      }

      // Search match: dhikr text, title, section
      if (!q) return true;

      const hay = [
        (it.text || "").toLowerCase(),
        (it.title || "").toLowerCase(),
        (it.section || "").toLowerCase(),
        (it.category || "").toLowerCase(),
        (it.reference || "").toLowerCase(),
        (it.note || "").toLowerCase(),
        (it.tags || []).join(" ").toLowerCase(),
      ].join(" ");

      return hay.includes(q);
    });
  }, [items, debouncedQuery, filters]);

  return { query, setQuery, filteredItems, filters, setFilters };
}
