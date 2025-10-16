// [LABEL: FILE] app/brief/[id]/page.tsx
// [LABEL: PURPOSE] Loads a brief by UUID and lets user edit the title, saving via /api/brief/save.
// [LABEL: RENDER] Simple, resilient UI with friendly errors; no schema changes required.

"use client";

import * as React from "react";

// [LABEL: TYPES]
type Brief = { id: string; title: string; created_at?: string };

// [LABEL: HELPERS]
async function fetchBrief(id: string): Promise<{ ok: boolean; data?: Brief; error?: string }> {
  try {
    const res = await fetch(`/api/brief/${id}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || "Failed to load brief" };
    // Endpoint returns JSON per your current build; normalize:
    const data: Brief = json?.data ?? json; 
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

// [LABEL: COMPONENT]
export default function BriefDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [brief, setBrief] = React.useState<Brief | null>(null);
  const [title, setTitle] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await fetchBrief(id);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error || "Unable to load brief");
      } else {
        setBrief(result.data!);
        setTitle(result.data!.title || "");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    setError(null);
    try {
      const data = await saveBrief(id, title.trim());
      if (data?.ok) {
        setSavedMsg("Saved!");
        setBrief(prev => (prev ? { ...prev, title: title.trim() } : prev));
      } else {
        setError(data?.error || "Save failed");
      }
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
      // Auto-clear the saved message after a short delay
      setTimeout(() => setSavedMsg(null), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* [LABEL: HEADER] */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Brief</h1>
        <p className="text-sm text-gray-500">ID: <span className="font-mono">{id}</span></p>
      </div>

      {/* [LABEL: STATES] */}
      {loading && <div className="text-gray-500">Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {/* [LABEL: FORM] */}
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
            <p className="text-xs text-gray-500">Update the brief title and click Save.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-4 py-2 border shadow-sm disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {savedMsg && <span className="text-green-600">{savedMsg}</span>}
          </div>
        </form>
      )}

      {/* [LABEL: SIDECAR] Friendly tips */}
      <div className="text-xs text-gray-500">
        This page uses your existing <code>/api/brief/[id]</code> reader and the new <code>/api/brief/save</code> writer.
      </div>
    </div>
  );
}
