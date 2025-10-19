// [LABEL: FILE] app/api/health/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request) {
  const started = Date.now();

  // --- Supabase quick check: head-only count on links (fast, low-cost)
  const checks: {
    supabase: { ok: boolean; count: number | null; error: string | null };
  } = { supabase: { ok: false, count: null, error: null } };

  try {
    const { error, count } = await supabaseAdmin
      .from("links")
      .select("id", { count: "exact", head: true });
    if (error) {
      checks.supabase.error = error.message ?? String(error);
    } else {
      checks.supabase.ok = true;
      checks.supabase.count = count ?? null;
    }
  } catch (e: any) {
    checks.supabase.error = e?.message ?? "unknown error";
  }

  // --- Environment snapshot (booleans, never exposing secret values)
  const env = {
    vercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,

    // presence flags only (no secrets echoed)
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    LINK_IP_HASH_SECRET: !!process.env.LINK_IP_HASH_SECRET,

    // helpful: which Supabase project this deployment is pointed at
    supabaseRef: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0]
      : null,
  };

  const status = checks.supabase.ok ? 200 : 500;

  return NextResponse.json(
    {
      ok: status === 200,
      uptime_ms: Date.now() - started,
      env,
      checks,
    },
    { status }
  );
}
