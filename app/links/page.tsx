"use client";
import * as React from "react";
import LinksPanel from "../brief/[id]/LinksPanel";

type Brief={ id:string; title:string; created_at?:string };

async function fetchBriefs(): Promise<Brief[]> {
  const r = await fetch("/api/brief/list", { cache:"no-store" });
  const j = await r.json();
  const items: any[] = Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : [];
  return items
    .filter(x=>x && typeof x.id==="string")
    .map(x=>({ id:x.id, title:x.title??"", created_at:x.created_at }))
    .sort((a,b)=> new Date(b.created_at??0).getTime()-new Date(a.created_at??0).getTime());
}
const useSearch=()=>{ const [p,setP]=React.useState<URLSearchParams>(new URLSearchParams(typeof window!=="undefined"?window.location.search:"")); React.useEffect(()=>{const fn=()=>setP(new URLSearchParams(window.location.search)); window.addEventListener("popstate",fn); return ()=>window.removeEventListener("popstate",fn);},[]); return p; };

export default function LinksPage(){
  const params = useSearch();
  const initialBrief = params.get("brief_id") || "";
  const initialUrl = params.get("url") || "";

  const [briefs,setBriefs]=React.useState<Brief[]>([]);
  const [loading,setLoading]=React.useState(true);
  const [selected,setSelected]=React.useState<string>(initialBrief);

  React.useEffect(()=>{ let off=false;(async()=>{ setLoading(true); const rows=await fetchBriefs(); if(off)return; setBriefs(rows); if(!initialBrief && rows.length) setSelected(rows[0].id); setLoading(false); })(); return ()=>{off=true}; },[]); // eslint-disable-line

  function onPick(e:React.ChangeEvent<HTMLSelectElement>){
    const id=e.target.value; setSelected(id);
    const u=new URL(window.location.href);
    if (id) u.searchParams.set("brief_id", id); else u.searchParams.delete("brief_id");
    window.history.replaceState({}, "", u.toString());
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Links</h1>
      {loading ? <div className="text-gray-500">Loading…</div> : (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm">Brief:</label>
            <select className="rounded-lg border px-3 py-2" value={selected} onChange={onPick}>
              {briefs.map(b=> <option key={b.id} value={b.id}>{b.title || "(untitled)"} — {b.id.slice(0,8)}</option>)}
            </select>
          </div>
          {selected ? <LinksPanel briefId={selected} initialUrl={initialUrl} /> : <div className="text-gray-500 text-sm">Pick a brief to manage links.</div>}
        </>
      )}
    </div>
  );
}
