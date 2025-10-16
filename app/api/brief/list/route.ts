// [LABEL: FILE] app/api/brief/list/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DEV/Preview friendly list for Briefs:
 * - Uses service role to avoid auth headaches in Preview.
 * - Returns minimal safe fields.
 * - Orders by updated_at desc.
 * - Limit 50 to keep payload small.
 *
 * NOTE: In production you can later switch to user-scoped lists.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("briefs")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
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
