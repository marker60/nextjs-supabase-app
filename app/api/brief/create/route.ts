// [LABEL: FILE] app/api/brief/create/route.ts
// [LABEL: PURPOSE] Create a new brief with a title; returns { ok, id, title }
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const titleRaw = (body?.title ?? "").toString();
    const title = titleRaw.trim() || "Untitled";

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) {
      return NextResponse.json({ ok: false, error: "Missing Supabase env vars" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Insert and return the new row's id + title; table: public.briefs(id uuid pk, title text, created_at timestamptz)
    const { data, error } = await supabase
      .from("briefs")
      .insert({ title })
      .select("id, title")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, id: data!.id, title: data!.title });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
