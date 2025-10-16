// [LABEL: FILE] app/brief/[id]/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Brief = {
  id: string;
  title: string | null;
  created_at: string;
};

export default function BriefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = React.useState<Brief | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setItem(null);

    try {
      const safeId = String(id || "").trim();
      if (!safeId || safeId === "<id>") {
        throw new Error(
          "No ID provided. Open this page from the Briefs list so it includes the real ID."
        );
      }

      const res = await fetch(`/api/brief/${safeId}`, { cache: "no-store" });
      const text = await res.text();

      // Try JSON; if HTML came back, show a clear error
      try {
        const json = JSON.parse(text);
        if (!json.ok) throw new Error(json.error || `Request failed: ${res.status}`);
        setItem(json.item as Brief);
      } catch {
        // text was not JSON (likely an HTML error/redirect)
        throw new Error(
          `Server returned non-JSON (${res.status}). Open from the Briefs list to load a valid ID.`
        );
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Brief</h1>
        <Link href="/brief" className="px-3 py-2 rounded-md border">
          ← All Briefs
        </Link>
      </header>

      {error ? (
        <div className="rounded-md border p-4 text-red-500">
          <div className="font-semibold">Draft</div>
          <div className="mt-1">
            Couldn’t load this draft: {error}
          </div>
        </div>
      ) : loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : item ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-500">ID: {item.id}</div>
          <div className="text-xl font-semibold">
            {item.title || "(untitled)"}
          </div>
          <div className="text-sm text-gray-500">
            Created {new Date(item.created_at).toLocaleString()}
          </div>

          {/* Placeholder for your editor form */}
          <div className="rounded-md border p-4">
            <div className="text-sm text-gray-500">Editor area</div>
            <p className="mt-1 text-gray-700">
              This is where a form/editor would go. For now, this confirms the
              record is loading correctly.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No data.</div>
      )}
    </div>
  );
}
