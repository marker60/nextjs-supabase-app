// [LABEL: FILE] app/links/page.tsx
"use client";

import * as React from "react";
import LinksPanel from "../brief/[id]/LinksPanel";

type Brief = { id: string; title: string; created_at?: string };

async function fetchBriefs(): Promise<Brief[]> {
  const res = await fetch("/api/brief/list", { cache: "no-store" });
  const json = await res.json();
  const items: any[] = Array.isArray(json) ? json : Array.isArray(json?.items) ? json.items : [];
  return items
    .filter((x) => x && typeof x.id === "string")
    .map((x) => ({ id: x.id, title: x.title ?? "", created_at: x.created_at }))
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
}

function useSearch() {
  const [params, setParams] = React.useState<URLSearchParams>(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""));
  React.useEffect(() => {
    const fn = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);
  return params;
}

export default function LinksPage() {
  const params = useSearch();
  const initialBrief = params.get("brief_id") || "";
  const initialUrl = params.get("url") || "";

  const [briefs, setBriefs] = React.useState<Brief[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<string>(initialBrief);

  React.useEffect(() => {
    let off = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await fetchBriefs();
        if (off) return;
        setBriefs(rows);
        // if no brief_id in URL, default to the newest
        if (!initialBrief && rows.length) setSelected(rows[0].id);
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, []); // eslint-disable-line

  function onPick(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelected(id);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("brief_id", id); else u.searchParams.delete("brief_id");
    window.history.replaceState({}, "", u.toString());
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Links</h1>

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm">Brief:</label>
            <select
              className="rounded-lg border px-3 py-2"
              value={selected}
              onChange={onPick}
            >
              {briefs.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title || "(untitled)"} — {b.id.slice(0,8)}
                </option>
              ))}
            </select>
          </div>

          {selected ? (
            // Pass through the optional ?url= to seed the create box
            <LinksPanel briefId={selected} initialUrl={initialUrl} />
          ) : (
            <div className="text-gray-500 text-sm">Pick a brief to manage links.</div>
          )}
        </>
      )}
    </div>
  );
}
