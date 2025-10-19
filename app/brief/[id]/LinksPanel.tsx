cat > app/brief/[id]/LinksPanel.tsx <<'TSX'
// app/brief/[id]/LinksPanel.tsx
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

const originSafe = () => (typeof location === "undefined" ? "" : location.origin);
const getQuery = (k: string) =>
  typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get(k) || "";
const isHttpUrl = (u: string) => /^https?:\/\//i.test(u);

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

  const seeded = React.useMemo(() => initialUrl || getQuery("url") || "", [initialUrl]);
  const [url, setUrl] = React.useState(seeded);
  const [creating, setCreating] = React.useState(false);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<string>("");

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

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/links/list?brief_id=${encodeURIComponent(briefId)}`, {
        cache: "no-store",
      });
      const j = await r.json();
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Load failed");
      setRows(normalize(j.items));
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, [briefId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const value = url.trim();
      if (!isHttpUrl(value)) { setError("URL must start with http(s)://"); return; }
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

  function startEdit(row: LinkRow) {
    setEditingId(row.id);
    setEditValue(row.dest_url || "");
  }
  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }
  async function saveEdit(id: string) {
    const next = editValue.trim();
    if (!isHttpUrl(next)) { setError("URL must start with http(s)://"); return; }
    const prev = rows;
    setRows(rows.map((r) => (r.id === id ? { ...r, dest_url: next } : r)));
    setEditingId(null);
    setEditValue("");
    try {
      const r = await fetch(`/api/links/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dest_url: next }),
      });
      const j = await r.json();
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Update failed");
      setMessage("Link updated");
    } catch (e: any) {
      setRows(prev);
      setError(e?.message || "Update failed");
    }
  }

  function askDelete(id: string) { setPendingDeleteId(id); }
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
  function cancelDelete() { setPendingDeleteId(null); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Links</h2>
        <div className="flex items-center gap-3">
          {msg && <span className="text-green-600 text-sm">{msg}</span>}
          <a
            href={`/api/links/export?brief_id=${encodeURIComponent(briefId)}`}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            Export CSV
          </a>
        </div>
      </div>

      <form onSubmit={onCreate} className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2 outline-none"
          placeholder="Paste destination URL (https://…)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          pattern="https?://.*"
          title="Must start with http:// or https://"
        />
        <button type="submit" disabled={creating} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60">
          {creating ? "Creating…" : "New Link"}
        </button>
      </form>

      {loading && <div className="text-gray-500">Loading links…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && (
        rows.length === 0 ? (
          <div className="text-gray-500 text-sm">No links yet.</div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {rows.map((r) => {
              const code = r.short_id || r.slug || "";
              const shortUrl = base ? `${base}/l/${code}` : `/l/${code}`;
              const isEditing = editingId === r.id;

              return (
                <li key={r.id} className="p-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    {!isEditing ? (
                      <>
                        <div className="font-medium truncate">{r.dest_url || r.destination_url || ""}</div>
                        <div className="text-xs text-gray-500">
                          {r.created_at ? new Date(r.created_at).toLocaleString() : "—"} · {r.clicks ?? 0} clicks{" "}
                          {r.last_click_at ? `· last: ${new Date(r.last_click_at).toLocaleString()}` : ""}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono break-all">{shortUrl}</div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Edit URL</label>
                        <input
                          className="w-full rounded-lg border px-3 py-2 outline-none"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="https://example.com"
                          required
                          pattern="https?://.*"
                          title="Must start with http:// or https://"
                        />
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="flex gap-2 justify-self-start sm:justify-self-end">
                      <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100">Open</a>
                      <CopyButton text={shortUrl} />
                      <button onClick={() => startEdit(r)} className="rounded-lg border px-3 py-1.5 text-sm">Edit</button>
                      <button onClick={() => askDelete(r.id)} className="rounded-lg border px-3 py-1.5 text-sm text-red-600">Delete</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-self-start sm:justify-self-end">
                      <button onClick={() => saveEdit(r.id)} className="rounded-lg border px-3 py-1.5 text-sm">Save</button>
                      <button onClick={cancelEdit} className="rounded-lg border px-3 py-1.5 text-sm">Cancel</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )
      )}

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Delete this link?</h3>
            <p className="mt-2 text-sm text-gray-600">This action cannot be undone. The short link will stop working immediately.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={cancelDelete} className="rounded-lg border px-3 py-1.5 text-sm">Cancel</button>
              <button onClick={confirmDelete} className="rounded-lg border px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
TSX
