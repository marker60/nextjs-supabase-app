"use client";
import * as React from "react";

type Recent = { ts: string; referer?: string | null; ua?: string | null };
type Daily = { day: string; total: number; unique?: number };

export default function StatsDrawer({
  linkId,
  open,
  onClose,
}: {
  linkId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [recent, setRecent] = React.useState<Recent[]>([]);
  const [daily, setDaily] = React.useState<Daily[]>([]);

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`/api/links/${encodeURIComponent(linkId)}/stats`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok || j?.ok === false) throw new Error(j?.error || "Failed to load stats");
        setRecent(j.recent ?? []);
        setDaily(j.daily ?? []);
      } catch (e: any) {
        setError(e?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, linkId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-zinc-900 shadow-xl border-l dark:border-zinc-700 p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Link stats</h3>
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-600">
            Close
          </button>
        </div>

        {loading && <div className="mt-4 text-gray-600 dark:text-zinc-400">Loading…</div>}
        {error && <div className="mt-4 text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            <section className="mt-6">
              <h4 className="font-medium mb-2">Last 10 clicks</h4>
              {recent.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-zinc-400">No clicks yet.</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {recent.map((r, i) => (
                    <li key={i} className="rounded-lg border dark:border-zinc-700 p-3">
                      <div className="text-gray-900 dark:text-zinc-100">
                        {new Date(r.ts).toLocaleString()}
                      </div>
                      {r.referer && (
                        <div className="text-[12px] text-gray-600 dark:text-zinc-400 break-all">
                          Referrer: {r.referer}
                        </div>
                      )}
                      {r.ua && (
                        <div className="text-[12px] text-gray-600 dark:text-zinc-400 break-all">
                          UA: {r.ua}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-6">
              <h4 className="font-medium mb-2">Last 14 days</h4>
              {daily.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-zinc-400">No data yet.</div>
              ) : (
                <div className="text-sm">
                  <div className="grid grid-cols-[100px_1fr_1fr] gap-2 font-mono text-[12px] text-gray-700 dark:text-zinc-300">
                    <div className="font-semibold">Day</div>
                    <div className="font-semibold">Clicks</div>
                    <div className="font-semibold">Unique</div>
                    {daily.map((d, i) => (
                      <React.Fragment key={i}>
                        <div>{d.day}</div>
                        <div>{d.total}</div>
                        <div>{d.unique ?? "—"}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
