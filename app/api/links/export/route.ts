// app/api/links/export/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function toCsvRow(fields: (string | number | null | undefined)[]) {
  return fields
    .map(v => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const brief_id = url.searchParams.get("brief_id") || "";
  if (!brief_id) {
    return new NextResponse("brief_id required", { status: 400 });
  }

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!sbUrl || !serviceKey) return new NextResponse("Missing Supabase env", { status: 500 });

  const supabase = createClient(sbUrl, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("links")
    .select("id, brief_id, destination_url, short_id, slug, clicks, last_click_at, created_at")
    .eq("brief_id", brief_id)
    .order("created_at", { ascending: false });

  if (error) return new NextResponse(error.message, { status: 500 });

  const header = ["id","brief_id","destination_url","short_code","clicks","last_click_at","created_at"];
  const rows = (data ?? []).map(r =>
    toCsvRow([
      r.id,
      r.brief_id,
      r.destination_url ?? "",
      r.short_id || r.slug || "",
      r.clicks ?? 0,
      r.last_click_at ?? "",
      r.created_at ?? "",
    ])
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="links-${brief_id}.csv"`,
      "cache-control": "no-store"
    }
  });
}
