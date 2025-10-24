// app/api/supa-ping/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server"; // client object (do not call)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Minimal query to ensure DB connectivity; adjust table if needed.
  const { error } = await supabaseAdmin.from("links").select("id", { head: true }).limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
