"use client";
import * as React from "react";

type SortMode = "newest" | "clicks" | "short";

export default function Toolbar({ briefId }: { briefId: string }) {
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<Date | null>(null);
  const [sortBy, setSortBy] = React.useState<SortMode>("newest");

  // Listen for updates coming from LinksPanel
  React.useEffect(() => {
    function onUpdated(e: Event) {
      const at = (e as CustomEvent).detail?.at as number | undefined;
      if (at) setLastUpdatedAt(new Date(at));
    }
    window.addEventListener("links:updated", onUpdated as EventListener);
    return () => window.removeEventListener("links:updated", onUpdated as EventListener);
  }, []);

  const emit = (name: string, detail?: any) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

  const onRefresh = () => emit("links:refresh");
  const onSortChange = (v: SortMode) => {
    setSortBy(v);
    emit("links:sort", { mode: v });
  };

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Links</h2>
          <span className="text-xs text-gray-500">
            {lastUpdatedAt ? `Updated ${lastUpdatedAt.toLocaleTimeString()}` : ""}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100"
            title="Refresh now"
          >
            Refresh
          </button>
          <label className="text-sm text-gray-600 flex items-center gap-2">
            Sort
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortMode)}
              className="rounded-lg border px-2 py-1 text-sm"
              aria-label="Sort links"
            >
              <option value="newest">Newest</option>
              <option value="clicks">Most Clicked</option>
              <option value="short">Shortcode A–Z</option>
            </select>
          </label>
          <a
            href={`/api/links/export?brief_id=${encodeURIComponent(briefId)}`}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            Export CSV
          </a>
        </div>
      </div>
    </div>
  );
}
