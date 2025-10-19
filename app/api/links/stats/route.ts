// [LABEL: FILE] app/api/links/stats/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    if (!id && !slug) {
      return NextResponse.json({ ok: false, error: "pass ?id= or ?slug=" }, { status: 400 });
    }

    let linkId = id;
    if (!linkId && slug) {
      const { data, error } = await supabaseAdmin.from("links").select("id").eq("slug", slug).single();
      if (error || !data) return NextResponse.json({ ok: false, error: "link not found" }, { status: 404 });
      linkId = data.id;
    }

    const { data: rows, error } = await supabaseAdmin
      .from("clicks")
      .select("created_at")
      .eq("link_id", linkId!)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw error;

    const total = rows?.length || 0;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const last24h = rows?.filter((r) => now - new Date(r.created_at).getTime() <= day).length || 0;
    const last7d = rows?.filter((r) => now - new Date(r.created_at).getTime() <= 7 * day).length || 0;

    return NextResponse.json({ ok: true, total, last24h, last7d });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
