"use client";
import * as React from "react";
import CopyButton from "../../components/CopyButton";

type LinkRow = {
  id: string;
  brief_id: string;
  dest_url?: string;
  destination_url?: string;
  short_id: string;
  slug?: string | null;
  clicks: number;
  last_click_at?: string | null;
  created_at?: string | null;
};

type SortMode = "newest" | "clicks" | "short";

const originSafe = () => (typeof location === "undefined" ? "" : location.origin);
const getQuery = (k: string) =>
  typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get(k) || "";
const isHttpUrl = (u: string) => /^https?:\/\//i.test(u);
const isValidSlug = (s: string) => /^[a-zA-Z0-9_-]{3,32}$/.test(s);

// className helper
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Button styles (good contrast in light & dark)
const btn = cn(
  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
  "bg-transparent text-gray-900 hover:bg-gray-100 hover:text-gray-900",
  "dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
);

const btnPrimary = cn(
  "rounded-lg border px-3 py-2 text-sm transition-colors",
  "bg-white text-gray-900 hover:bg-gray-100",
  "dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700"
);

const btnDanger = cn(
  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
  "text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800",
  "dark:text-red-400 dark:border-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-300"
);

export default function LinksPanel({
  briefId,
  initialUrl = "",
}: {
  briefId: string;
  initialUrl?: string;
}) {
  const [rows, setRows] = React.useState<LinkRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  const [sortBy, setSortBy] = React.useState<SortMode>("newest");
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState<boolean>(false);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);

  // create
  const seeded = React.useMemo(() => initialUrl || getQuery("url") || "", [initialUrl]);
  const [url, setUrl] = React.useState(seeded);
  const [creating, setCreating] = React.useState(false);

  // edit state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<string>("");
  const [editSlug, setEditSlug] = React.useState<string>("");

  // delete modal
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

  const base = originSafe();

  function setMessage(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(null), 1500);
  }

  function normalize(list: any[]): LinkRow[] {
    return (list ?? []).map((r) => ({
      ...r,
      dest_url: r.dest_url ?? r.destination_url,
    }));
  }

  function sortList(list: LinkRow[], mode: SortMode): LinkRow[] {
    const copy = [...list];
    switch (mode) {
      case "clicks":
        copy.sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));
        break;
      case "short":
        copy.sort((a, b) =>
          (a.slug || a.short_id || "").localeCompare(b.slug || b.short_id || "")
        );
        break;
      case "newest":
      default:
        copy.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        );
        break;
    }
    return copy;
  }

  // Base load (first page)
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/links/list?brief_id=${encodeURIComponent(briefId)}&limit=20`,
        { cache: "no-store" },
      );
      const j = await r.json();
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Load failed");
      const items = normalize(j.items);
      setRows(sortList(items, sortBy));
      setCursor(j.next_cursor || null);
      setHasMore(!!j.next_cursor);
      window.dispatchEvent(new CustomEvent("links:updated", { detail: { at: Date.now() } }));
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, [briefId, sortBy]);

  // Load next page
  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/links/list?brief_id=${encodeURIComponent(briefId)}&limit=20&cursor=${encodeURIComponent(
          cursor,
        )}`,
        { cache: "no-store" },
      );
      const j = await r.json();
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Load more failed");
      const items = normalize(j.items);
      const merged = [...rows, ...items];
      setRows(sortList(merged, sortBy));
      setCursor(j.next_cursor || null);
      setHasMore(!!j.next_cursor);
    } catch (e: any) {
      setError(e?.message || "Load more failed");
    } finally {
      setLoadingMore(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  // CREATE
  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const value = url.trim();
      if (!isHttpUrl(value)) {
        setError("URL must start with http(s)://");
        return;
      }
      setCreating(true);
      const r = await fetch(`/api/links/create`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief_id: briefId, dest_url: value }),
      });
      const j = await r.json();
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Create failed");
      setUrl("");
      setMessage("Link created");
      await load();
    } catch (e: any) {
      setError(e?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  // EDIT
  function startEdit(row: LinkRow) {
    setEditingId(row.id);
    setEditValue(row.dest_url || "");
    setEditSlug(row.slug || "");
  }
  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
    setEditSlug("");
  }
  async function saveEdit(id: string) {
    const nextUrl = editValue.trim();
    const nextSlug = editSlug.trim();
    if (nextUrl && !isHttpUrl(nextUrl)) {
      setError("URL must start with http(s)://");
      return;
    }
    if (nextSlug && !isValidSlug(nextSlug)) {
      setError("Short code must be 3–32 chars: letters, numbers, dash, underscore");
      return;
    }

    const prev = rows;
    setRows(
      rows.map((r) =>
        r.id === id ? { ...r, dest_url: nextUrl || r.dest_url, slug: nextSlug || null } : r
      )
    );
    setEditingId(null);

    try {
      const payload: any = {};
      if (nextUrl) payload.dest_url = nextUrl;
      payload.slug = nextSlug;

      const r = await fetch(`/api/links/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Update failed");
      setMessage("Link updated");
      await load();
    } catch (e: any) {
      setRows(prev);
      setError(e?.message || "Update failed");
    }
  }

  // DELETE (with modal)
  function askDelete(id: string) {
    setPendingDeleteId(id);
  }
  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    const prev = rows;
    setRows(rows.filter((r) => r.id !== id));
    try {
      const r = await fetch(`/api/links/${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Delete failed");
      setMessage("Link deleted");
    } catch (e: any) {
      setRows(prev);
      setError(e?.message || "Delete failed");
    }
  }
  function cancelDelete() {
    setPendingDeleteId(null);
  }

  const baseUrl = (r: LinkRow) => {
    const code = r.slug || r.short_id || "";
    return base ? `${base}/l/${code}` : `/l/${code}`;
  };

  return (
    <div className="space-y-4">
      {/* Controls row (kept here) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Links</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-zinc-400 flex items-center gap-2">
            Sort
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              className={cn(
                "rounded-lg border px-2 py-1 text-sm",
                "bg-white text-gray-900",
                "dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600"
              )}
              aria-label="Sort links"
            >
              <option value="newest">Newest</option>
              <option value="clicks">Most Clicked</option>
              <option value="short">Shortcode A–Z</option>
            </select>
          </label>
          <button onClick={load} className={btn} title="Refresh now">
            Refresh
          </button>
          <a
            href={`/api/links/export?brief_id=${encodeURIComponent(briefId)}`}
            className={btn}
          >
            Export CSV
          </a>
          {msg && <span className="text-green-600 text-sm">{msg}</span>}
        </div>
      </div>

      {/* Create */}
      <form onSubmit={onCreate} className="flex flex-col sm:flex-row gap-2">
        <input
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 outline-none",
            "bg-white text-gray-900 placeholder-gray-500",
            "dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:placeholder-zinc-500"
          )}
          placeholder="Paste destination URL (https://…)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          pattern="https?://.*"
          title="Must start with http:// or https://"
        />
        <button type="submit" disabled={creating} className={btnPrimary}>
          {creating ? "Creating…" : "New Link"}
        </button>
      </form>

      {loading && <div className="text-gray-500 dark:text-zinc-400">Loading links…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        rows.length === 0 ? (
          <div className="text-gray-500 text-sm dark:text-zinc-400">No links yet.</div>
        ) : (
          <>
            <ul className="divide-y rounded-lg border dark:border-zinc-700">
              {rows.map((r) => {
                const shortUrl = baseUrl(r);
                const isEditing = editingId === r.id;

                return (
                  <li
                    key={r.id}
                    className="p-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    {/* Left */}
                    <div className="min-w-0">
                      {!isEditing ? (
                        <>
                          <div className="font-medium truncate">
                            {r.dest_url || r.destination_url || ""}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400">
                            {r.created_at
                              ? new Date(r.created_at).toLocaleString()
                              : "—"}{" "}
                            · {r.clicks ?? 0} clicks{" "}
                            {r.last_click_at
                              ? `· last: ${new Date(r.last_click_at).toLocaleString()}`
                              : ""}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-zinc-400 font-mono break-all">
                            {shortUrl}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Edit URL</label>
                            <input
                              className={cn(
                                "mt-1 w-full rounded-lg border px-3 py-2 outline-none",
                                "bg-white text-gray-900",
                                "dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                              )}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="https://example.com"
                              required
                              pattern="https?://.*"
                              title="Must start with http:// or https://"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Short code (optional)</label>
                            <input
                              className={cn(
                                "mt-1 w-full rounded-lg border px-3 py-2 outline-none",
                                "bg-white text-gray-900",
                                "dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                              )}
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              placeholder="my-alias"
                              pattern="[A-Za-z0-9_-]{3,32}"
                              title="3–32 chars: letters, numbers, dash, underscore"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                              Leave blank to use the auto-generated code.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right actions */}
                    {!isEditing ? (
                      <div className="flex gap-2 justify-self-start sm:justify-self-end">
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={btn}
                        >
                          Open
                        </a>
                        <CopyButton text={shortUrl} />
                        <button onClick={() => startEdit(r)} className={btn}>
                          Edit
                        </button>
                        <button onClick={() => askDelete(r.id)} className={btnDanger}>
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-self-start sm:justify-self-end">
                        <button onClick={() => saveEdit(r.id)} className={btn}>
                          Save
                        </button>
                        <button onClick={cancelEdit} className={btn}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center">
                <button onClick={loadMore} disabled={loadingMore} className={btn}>
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )
      )}

      {/* Delete Confirmation Modal */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl border dark:border-zinc-700">
            <h3 className="text-lg font-semibold">Delete this link?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
              This action cannot be undone. The short link will stop working immediately.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={cancelDelete} className={btn}>
                Cancel
              </button>
              <button onClick={confirmDelete} className={btnDanger}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
