// app/brief/page.tsx
"use client";

import * as React from "react";

type Brief = { id: string; title: string; created_at?: string | null };

function fmt(ts?: string | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

async function fetchBriefs(): Promise<Brief[]> {
  // Try /api/brief/list first, then /api/briefs/list for compatibility.
  const endpoints = ["/api/brief/list", "/api/briefs/list"];
  for (const url of endpoints) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j && Array.isArray(j.items ?? j.briefs ?? j)) {
        const arr = (j.items ?? j.briefs ?? j) as any[];
        // Coerce to Brief shape
        return arr
          .filter((x): x is Brief => !!x && typeof x.id === "string")
          .map((x) => ({ id: x.id, title: x.title ?? "", created_at: x.created_at ?? null }))
          .sort(
            (a, b) =>
              new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
          );
      }
    } catch {
      // try next endpoint
    }
  }
  return [];
}

export default function BriefsPage() {
  const [briefs, setBriefs] = React.useState<Brief[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchBriefs();
      setBriefs(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load briefs");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Briefs</h1>
        <button
          onClick={load}
          className="rounded-lg border px-3 py-1.5 text-sm transition-colors
                     bg-transparent text-gray-900 hover:bg-gray-100 hover:text-gray-900
                     dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-600 dark:text-zinc-400">Loading briefs…</div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && briefs.length === 0 && (
        <div className="text-sm text-gray-600 dark:text-zinc-400">No briefs yet.</div>
      )}

      {!loading && !error && briefs.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {briefs.map((b) => (
            <li key={b.id}>
              <a
                href={`/brief/${b.id}`}
                className="group block rounded-xl border p-4 transition-colors
                           bg-white hover:bg-gray-100
                           dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div
                  className="text-lg font-semibold truncate
                             text-gray-900 dark:text-zinc-100"
                >
                  {b.title || "(untitled)"}
                </div>
                <div
                  className="mt-1 text-xs
                             text-gray-600 dark:text-zinc-400"
                >
                  {fmt(b.created_at)}
                </div>

                {/* subtle footer line; color stays readable on hover */}
                <div
                  className="mt-3 text-[11px] tracking-wide
                             text-gray-500 dark:text-zinc-500"
                >
                  ID: {b.id}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
