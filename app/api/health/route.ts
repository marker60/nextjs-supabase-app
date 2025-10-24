// [FILE: app/api/health/route.ts]
// [LABEL: PURPOSE]
// Health check endpoint to verify API is up and Supabase is reachable.
// Fix: correctly INVOKE supabaseAdmin() to get a client instance before using .from(...)

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: {
    api: boolean;
    supabase: { ok: boolean; error?: string; count?: number };
  } = {
    api: true,
    supabase: { ok: false },
  };

  try {
    // IMPORTANT: call the function to get the Supabase client instance
    const admin = supabaseAdmin();

    const { error, count } = await admin
      .from("links")
      .select("id", { count: "exact", head: true });

    if (error) {
      checks.supabase.error = error.message ?? String(error);
    } else {
      checks.supabase.ok = true;
      checks.supabase.count = count ?? 0;
    }
  } catch (err: any) {
    checks.supabase.error = err?.message ?? String(err);
  }

  return NextResponse.json({
    ok: checks.api && checks.supabase.ok,
    checks,
  });
}
