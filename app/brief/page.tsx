// [LABEL: FILE] app/brief/page.tsx
"use client";

import React from "react";
import Link from "next/link";

type BriefItem = {
  id: string;
  title: string | null;
  created_at: string;
};

export default function BriefsPage() {
  const [items, setItems] = React.useState<BriefItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brief/list", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Request failed: ${res.status}`);
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Briefs</h1>
        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error ? (
        <div className="text-red-500">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-1">
            If this persists, try{" "}
            <Link className="underline" href="/auth/login">
              logging in
            </Link>{" "}
            and reloading.
          </p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No briefs yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((b) => (
            <li key={b.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {b.title || "(untitled)"}
                </div>
                <div className="text-xs text-gray-500">
                  Created {new Date(b.created_at).toLocaleString()}
                </div>
              </div>
              <Link
                href={`/brief/${b.id}`}
                className="px-3 py-2 rounded-md border"
                title="Open brief"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
