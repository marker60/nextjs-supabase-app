// [LABEL: FILE] app/api/links/list/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1) Get latest links (table name only; Supabase defaults to 'public')
    const { data: links, error } = await supabaseAdmin
      .from("links")
      .select("id, slug, title, destination_url, tags, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    // 2) Get click rows and aggregate
    const { data: clicks, error: clickErr } = await supabaseAdmin
      .from("clicks")
      .select("link_id");
    if (clickErr) throw clickErr;

    const counts: Record<string, number> = {};
    (clicks ?? []).forEach((row: any) => {
      counts[row.link_id] = (counts[row.link_id] || 0) + 1;
    });

    const items = (links ?? []).map((l) => ({
      ...l,
      click_count: counts[l.id] || 0,
    }));

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
