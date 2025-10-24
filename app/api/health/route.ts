// app/api/health/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server"; // client object (do not call)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Lightweight health check: count rows in a known table
  const { error, count } = await supabaseAdmin
    .from("links")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, linksCount: count ?? 0 }, { status: 200 });
}
