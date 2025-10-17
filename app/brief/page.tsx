// [LABEL: FILE] app/brief/page.tsx
// [LABEL: PURPOSE] Briefs index with search, sort, pagination, and sparkline (typed for noImplicitAny).

"use client";
import * as React from "react";
import Sparkline from "../components/Sparkline";

type Brief = { id: string; title: string; created_at?: string };

type ListResp =
  | { ok?: boolean; items?: unknown }
  | { items?: unknown }
  | unknown;

const PAGE_SIZE = 10;

// Type guard for list rows coming back in various shapes
function isBriefLike(u: unknown): u is { id: string; title?: unknown; created_at?: unknown } {
  return !!u && typeof (u as any).id === "string";
}

async function fetchBriefs(): Promise<Brief[]> {
  const res = await fetch("/api/brief/list", { cache: "no-store" });
  const json: ListResp = await res.json();

  const raw: unknown[] = Array.isArray(json)
    ? (json as unknown[])
    : Array.isArray((json as any)?.items)
      ? ((json as any).items as unknown[])
      : [];

  const rows: Brief[] = raw
    .filter((u: unknown): u is { id: string; title?: unknown; created_at?: unknown } => isBriefLike(u))
    .map((u: { id: string; title?: unknown; created_at?: unknown }): Brief => ({
      id: u.id,
      title: typeof u.title === "string" ? u.title : "",
      created_at: typeof u.created_at === "string" ? u.created_at : undefined,
    }))
    .sort((a: Brief, b: Brief) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );

  return rows;
}

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = React.useState<T>(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function BriefListPage() {
  const [all, setAll] = React.useState<Brief[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState("");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const qd = useDebounced(q, 250);

  React.useEffect(() => {
    let off = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchBriefs();
        if (off) return;
        setAll(rows);
      } catch (e: any) {
        if (off) return;
        setError(e?.message ?? "Failed to load briefs");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const needle = qd.trim().toLowerCase();
    let rows = !needle
      ? all
      : all.filter((b: Brief) =>
          (b.title ?? "").toLowerCase().includes(needle) || b.id.toLowerCase().includes(needle)
        );

    rows = rows.slice().sort((a: Brief, b: Brief) => {
      const da = new Date(a.created_at ?? 0).getTime();
      const db = new Date(b.created_at ?? 0).getTime();
      return sortAsc ? da - db : db - da;
    });

    return rows;
  }, [all, qd, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [qd, sortAsc]);

  const sparkData = React.useMemo(() => {
    if (!all.length) return [] as number[];
    const now = new Date();
    const weeks = 12;
    const buckets = new Array<number>(weeks).fill(0);

    for (const b of all) {
      const d = b.created_at ? new Date(b.created_at) : null;
      if (!d || isNaN(d.getTime())) continue;
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      const bucket = Math.floor(diffDays / 7);
      if (bucket >= 0 && bucket < weeks) {
        buckets[weeks - 1 - bucket] += 1;
      }
    }
    return buckets;
  }, [all]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Briefs</h1>
          <p className="text-sm text-gray-500">{all.length} total</p>
        </div>
        <div className="hidden md:flex items-center gap-3 text-gray-600">
          <span className="text-xs">Last 12 weeks</span>
          <div className="w-[140px] text-gray-400">
            <Sparkline data={sparkData} width={140} height={28} strokeWidth={2} ariaLabel="briefs cadence" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          className="flex-1 rounded-lg border px-3 py-2 outline-none"
          placeholder="Search by title or ID…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={() => setSortAsc((s) => !s)}
          className="rounded-lg border px-3 py-2 text-sm"
          title="Toggle sort (Newest/Oldest)"
        >
          Sort: {sortAsc ? "Oldest" : "Newest"}
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && (
        <>
          {pageRows.length === 0 ? (
            <div className="text-gray-500 text-sm">No briefs match your search.</div>
          ) : (
            <ul className="divide-y rounded-lg border">
              {pageRows.map((b: Brief) => (
                <li key={b.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.title || "(untitled)"}</div>
                    <div className="text-xs text-gray-500">
                      {b.created_at ? new Date(b.created_at).toLocaleString() : "—"}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono break-all">{b.id}</div>
                  </div>
                  <a
                    href={`/brief/${b.id}`}
                    className="shrink-0 rounded-lg border px-3 py-1.5 text-sm ml-4 hover:bg-gray-100"
                    title="Open"
                  >
                    Open
                  </a>
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 && (
            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <div className="text-xs text-gray-500">
                Page {current} of {pageCount}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={current === pageCount}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
