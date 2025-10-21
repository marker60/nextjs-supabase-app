// app/api/links/[id]/stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function json(status: number, body: any) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
function ok(body: any) {
  return json(200, { ok: true, ...body });
}
function bad(msg: string, code = 400) {
  return json(code, { ok: false, error: msg });
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params?.id;
    if (!id) return bad("id required");

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!sbUrl || !serviceKey) return bad("Missing Supabase env", 500);

    const supabase = createClient(sbUrl, serviceKey, { auth: { persistSession: false } });

    // Last 10 clicks (most recent first)
    const { data: recent, error: rerr } = await supabase
      .from("clicks_log")
      .select("ts, referer, ua")
      .eq("link_id", id)
      .order("ts", { ascending: false })
      .limit(10);
    if (rerr) return bad(rerr.message, 500);

    // 14-day daily totals (and unique IPs)
    const { data: daily, error: derr } = await supabase.rpc("clicks_daily_stats", {
      p_link_id: id,
      p_days: 14,
    });
    // If the RPC doesn't exist yet, fall back to a direct query per day (less efficient)
    let dailyStats = daily;
    if (derr || !Array.isArray(daily)) {
      // fallback (compute in SQL: group by date(ts))
      const { data: fallback, error: ferr } = await supabase
        .from("clicks_log")
        .select("ts, ip_hash")
        .eq("link_id", id)
        .gte("ts", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());
      if (ferr) return bad(ferr.message, 500);
      const map = new Map<string, { total: number; unique: number; set: Set<string> }>();
      for (const row of fallback ?? []) {
        const d = new Date(row.ts);
        const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
        if (!map.has(key)) map.set(key, { total: 0, unique: 0, set: new Set() });
        const rec = map.get(key)!;
        rec.total += 1;
        if (row.ip_hash) rec.set.add(row.ip_hash);
      }
      dailyStats = Array.from(map.entries())
        .map(([day, value]) => ({ day, total: value.total, unique: value.set.size }))
        .sort((a, b) => a.day.localeCompare(b.day));
    }

    return ok({ recent: recent ?? [], daily: dailyStats ?? [] });
  } catch (e: any) {
    return bad(e?.message || "Unexpected error", 500);
  }
}

export const dynamic = "force-dynamic";
export const runtime = "edge";
