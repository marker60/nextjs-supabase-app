// [FILE: app/api/links/stats/route.ts]
// [LABEL: PURPOSE]
// Stats endpoint for a link by id or slug. FIX: correctly INVOKE supabaseAdmin() before using .from(...)

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const slug = url.searchParams.get("slug");
    const rangeDaysParam = url.searchParams.get("days");
    const rangeDays = Number.isFinite(Number(rangeDaysParam)) ? Math.max(1, parseInt(rangeDaysParam || "30", 10)) : 30;

    if (!id && !slug) {
      return NextResponse.json({ ok: false, error: "missing id or slug" }, { status: 400 });
    }

    // IMPORTANT: get an actual client instance
    const admin = supabaseAdmin();

    // Resolve id from slug if needed
    let linkId = id ?? "";
    if (!linkId && slug) {
      const { data, error } = await admin
        .from("links")
        .select("id")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        return NextResponse.json({ ok: false, error: "link not found" }, { status: 404 });
      }
      linkId = data.id as string;
    }

    // Date range (UTC) for recent stats
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - rangeDays);

    // Total clicks
    const { count: total_clicks, error: clicksErr } = await admin
      .from("clicks")
      .select("id", { count: "exact", head: true })
      .eq("link_id", linkId);

    if (clicksErr) {
      return NextResponse.json({ ok: false, error: clicksErr.message }, { status: 500 });
    }

    // Total conversions
    const { count: total_conversions, error: convErr } = await admin
      .from("conversions")
      .select("id", { count: "exact", head: true })
      .eq("link_id", linkId);

    if (convErr) {
      return NextResponse.json({ ok: false, error: convErr.message }, { status: 500 });
    }

    // Recent clicks (last N days)
    const { count: recent_clicks, error: rClicksErr } = await admin
      .from("clicks")
      .select("id", { count: "exact", head: true })
      .eq("link_id", linkId)
      .gte("occurred_at", since.toISOString());

    if (rClicksErr) {
      return NextResponse.json({ ok: false, error: rClicksErr.message }, { status: 500 });
    }

    // Recent conversions (last N days)
    const { count: recent_conversions, error: rConvErr } = await admin
      .from("conversions")
      .select("id", { count: "exact", head: true })
      .eq("link_id", linkId)
      .gte("converted_at", since.toISOString());

    if (rConvErr) {
      return NextResponse.json({ ok: false, error: rConvErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      link_id: linkId,
      days: rangeDays,
      totals: {
        clicks: total_clicks ?? 0,
        conversions: total_conversions ?? 0,
      },
      recent: {
        clicks: recent_clicks ?? 0,
        conversions: recent_conversions ?? 0,
        since: since.toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "internal error" }, { status: 500 });
  }
}
