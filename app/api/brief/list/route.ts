// [LABEL: FILE] app/api/brief/list/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public/preview-friendly list of briefs.
 * Uses service role; returns minimal fields; newest-first by created_at.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("briefs")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ ok: true, items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
