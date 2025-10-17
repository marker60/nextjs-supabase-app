// [LABEL: FILE] app/briefs/[id]/page.tsx
// Full component (no re-export) to avoid "not a module" errors.
"use client";
import * as React from "react";

type Brief = { id: string; title: string; created_at?: string };

async function fetchBrief(id: string): Promise<{ ok: boolean; data?: Brief; error?: string }> {
  try {
    const res = await fetch(`/api/brief/${id}`, { cache: "no-store" });
    const json = await res.json();
    if (json?.ok === false) return { ok: false, error: json.error || "Failed to load brief" };
    const data: Brief = json?.item ?? json?.data ?? json;
    if (!data?.id) return { ok: false, error: "Brief not found" };
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error" };
  }
}

async function saveBrief(id: string, title: string) {
  const res = await fetch("/api/brief/save", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, title }),
  });
  return res.json();
}

export default function BriefsDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [brief, setBrief] = React.useState<Brief | null>(null);
  const [title, setTitle] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let off = false;
    (async () => {
      setLoading(true);
      const r = await fetchBrief(id);
      if (off) return;
      if (!r.ok) setError(r.error || "Load failed");
      else {
        setBrief(r.data!);
        setTitle(r.data!.title ?? "");
      }
      setLoading(false);
    })();
    return () => { off = true; };
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    const r = await saveBrief(id, title.trim());
    if (r?.ok) {
      setSavedMsg("Saved!");
      setBrief(b => (b ? { ...b, title: title.trim() } : b));
      setTimeout(() => setSavedMsg(null), 1200);
    } else {
      setError(r?.error || "Save failed");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Briefs</h1>
        <p className="text-xs text-gray-500">ID: <span className="font-mono">{id}</span></p>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && brief && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title…"
              maxLength={200}
              required
            />
            <p className="text-xs text-gray-500">Edit the title and click Save.</p>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="rounded-lg px-4 py-2 border shadow-sm disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
            {savedMsg && <span className="text-green-600">{savedMsg}</span>}
          </div>
        </form>
      )}
    </div>
  );
}
