"use client";
import * as React from "react";
import CopyButton from "../../components/CopyButton";

type LinkRow = { id:string; brief_id:string; dest_url:string; short_id:string; slug?:string|null; clicks:number; last_click_at?:string|null; created_at?:string|null; };

const originSafe = () => (typeof location === "undefined" ? "" : location.origin);
const getQuery = (k:string) => (typeof window==="undefined" ? "" : (new URLSearchParams(window.location.search)).get(k)||"");

export default function LinksPanel({ briefId, initialUrl="" }: { briefId:string; initialUrl?:string }) {
  const [rows, setRows] = React.useState<LinkRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string|null>(null);

  const seeded = React.useMemo(()=> initialUrl || getQuery("url") || "", [initialUrl]);
  const [url, setUrl] = React.useState(seeded);
  const [creating, setCreating] = React.useState(false);
  const base = originSafe();

  async function load(){
    setLoading(true); setError(null);
    try{
      const r = await fetch(`/api/links/list?brief_id=${encodeURIComponent(briefId)}`, { cache:"no-store" });
      const j = await r.json();
      if (!r.ok || j?.ok===false) throw new Error(j?.error||"Load failed");
      setRows(Array.isArray(j.items) ? j.items : []);
    }catch(e:any){ setError(e?.message||"Load failed"); } finally { setLoading(false); }
  }
  React.useEffect(()=>{ load(); }, [briefId]);

  async function onCreate(e:React.FormEvent){
    e.preventDefault();
    try{
      setCreating(true);
      const r = await fetch(`/api/links/create`, {
        method:"POST", headers:{ "content-type":"application/json" },
        body: JSON.stringify({ brief_id:briefId, dest_url:url.trim() })
      });
      const j = await r.json();
      if (!r.ok || j?.ok===false) throw new Error(j?.error||"Create failed");
      setUrl(""); await load();
    }catch(e:any){ setError(e?.message||"Create failed"); } finally { setCreating(false); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Links</h2>

      <form onSubmit={onCreate} className="flex flex-col sm:flex-row gap-2">
        <input className="flex-1 rounded-lg border px-3 py-2 outline-none"
               placeholder="Paste destination URL (https://…)" value={url}
               onChange={e=>setUrl(e.target.value)} required pattern="https?://.*"
               title="Must start with http:// or https://" />
        <button type="submit" disabled={creating} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60">
          {creating ? "Creating…" : "New Link"}
        </button>
      </form>

      {loading && <div className="text-gray-500">Loading links…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && (
        rows.length===0 ? (
          <div className="text-gray-500 text-sm">No links yet.</div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {rows.map(r=>{
              const code = r.short_id || r.slug || "";
              const shortUrl = base ? `${base}/l/${code}` : `/l/${code}`;
              return (
                <li key={r.id} className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.dest_url}</div>
                    <div className="text-xs text-gray-500">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "—"} · {r.clicks ?? 0} clicks {r.last_click_at ? `· last: ${new Date(r.last_click_at).toLocaleString()}` : ""}
                  </div>
                    <div className="text-[11px] text-gray-400 font-mono break-all">{shortUrl}</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100">Open</a>
                    <CopyButton text={shortUrl} />
                  </div>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}
