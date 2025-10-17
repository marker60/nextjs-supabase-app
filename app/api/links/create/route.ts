// [LABEL: FILE] app/api/links/create/route.ts
// [LABEL: PURPOSE] Create a short link for a brief (slug=short_id for older schemas).
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function nanoid(len = 8) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const brief_id = String(body?.brief_id || "").trim();
    const dest_url = String(body?.dest_url || "").trim();

    if (!brief_id) return NextResponse.json({ ok: false, error: "brief_id required" }, { status: 400 });
    if (!dest_url || !/^https?:\/\//i.test(dest_url)) {
      return NextResponse.json({ ok: false, error: "dest_url must start with http(s)://" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) return NextResponse.json({ ok: false, error: "Missing Supabase env" }, { status: 500 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    // ensure short_id unique
    let short_id = nanoid(8);
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabase.from("links").select("id").eq("short_id", short_id).maybeSingle();
      if (!exists) break;
      short_id = nanoid(8);
    }

    // Set slug=short_id to satisfy older NOT NULL slug schemas
    const insert = { brief_id, dest_url, short_id, slug: short_id };

    const { data, error } = await supabase
      .from("links")
      .insert(insert)
      .select("id, brief_id, dest_url, short_id, slug, clicks, last_click_at, created_at")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
