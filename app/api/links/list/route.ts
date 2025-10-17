// [LABEL: FILE] app/api/links/list/route.ts
// [LABEL: PURPOSE] List links for a brief: /api/links/list?brief_id=UUID
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brief_id = String(searchParams.get("brief_id") || "");
  if (!brief_id) return NextResponse.json({ ok: false, error: "brief_id required" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) return NextResponse.json({ ok: false, error: "Missing Supabase env" }, { status: 500 });

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("links")
    .select("id, brief_id, dest_url, short_id, slug, clicks, last_click_at, created_at")
    .eq("brief_id", brief_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, items: data ?? [] });
}
