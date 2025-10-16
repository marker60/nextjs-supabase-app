// [LABEL: FILE] app/api/brief/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/brief/[id]
 * Returns a single brief by id with minimal fields.
 * Uses service role so it works in Preview without auth friction.
 */
export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  try {
    const id = (ctx.params?.id || "").trim();
    if (!id || id === "<id>") {
      return NextResponse.json(
        { ok: false, error: "invalid id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("briefs")
      .select("id, title, created_at")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
