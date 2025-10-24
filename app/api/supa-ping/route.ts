// [FILE: app/api/supa-ping/route.ts]
// [LABEL: PURPOSE]
// Simple Supabase ping endpoint to verify connectivity.
// Fix: replace non-existent getSupabaseServer import with supabaseAdmin()
// and INVOKE supabaseAdmin() to get a client instance before using .from(...)

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // IMPORTANT: call supabaseAdmin() to get the client instance
    const admin = supabaseAdmin();

    // Lightweight head-count to confirm DB + PostgREST are reachable.
    // Uses an existing table. If your project uses a different table, swap "links" for that.
    const { error, count } = await admin
      .from("links")
      .select("id", { head: true, count: "exact" });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: count ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
