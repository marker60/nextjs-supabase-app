// app/api/supa-ping/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Prototype connectivity ping. No DB to avoid RLS/auth edge cases.
 */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
