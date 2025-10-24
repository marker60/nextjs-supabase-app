// app/api/health/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Minimal health endpoint for prototype: no DB call, always OK.
 * (Keeps builds stable regardless of RLS/auth state.)
 */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
