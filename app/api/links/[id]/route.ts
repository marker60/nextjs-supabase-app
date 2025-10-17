import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = String(params?.id || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const body = await req.json().catch(() => ({} as any));
  const dest_url = String(body?.dest_url || "").trim();
  if (!isHttpUrl(dest_url)) return NextResponse.json({ ok: false, error: "dest_url must start with http(s)://" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) return NextResponse.json({ ok: false, error: "Missing Supabase env" }, { status: 500 });

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("links")
    .update({ dest_url })
    .eq("id", id)
    .select("id, brief_id, dest_url, short_id, slug, clicks, last_click_at, created_at")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = String(params?.id || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) return NextResponse.json({ ok: false, error: "Missing Supabase env" }, { status: 500 });

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabase.from("links").delete().eq("id", id);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
