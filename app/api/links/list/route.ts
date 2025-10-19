// app/api/links/list/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function json(status: number, body: any) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
function ok(body: any) {
  return json(200, { ok: true, ...body });
}
function bad(msg: string, code = 400) {
  return json(code, { ok: false, error: msg });
}

// cursor format (base64): "<created_at>|<id>"
function encodeCursor(created_at: string, id: string) {
  return Buffer.from(`${created_at}|${id}`, "utf8").toString("base64");
}
function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  try {
    const raw = Buffer.from(cursor, "base64").toString("utf8");
    const [created_at, id] = raw.split("|");
    if (!created_at || !id) return null;
    return { created_at, id };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const brief_id = url.searchParams.get("brief_id") || "";
    if (!brief_id) return bad("brief_id required");

    // optional pagination
    const limitParam = url.searchParams.get("limit");
    const limit = Math.max(1, Math.min(100, Number(limitParam || 20))) || 20;
    const cursor = decodeCursor(url.searchParams.get("cursor"));

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!sbUrl || !serviceKey) return bad("Missing Supabase env", 500);

    const supabase = createClient(sbUrl, serviceKey, { auth: { persistSession: false } });

    // Base query: newest first
    let query = supabase
      .from("links")
      .select(
        "id, brief_id, destination_url, short_id, slug, clicks, last_click_at, created_at",
      )
      .eq("brief_id", brief_id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }) // deterministic within same timestamp
      .limit(limit + 1); // overfetch to know if there's a next page

    // Keyset pagination using OR:
    // (created_at < cursor.created_at) OR (created_at = cursor.created_at AND id < cursor.id)
    if (cursor) {
      const created = cursor.created_at;
      const id = cursor.id;
      query = query.or(
        `created_at.lt.${created},and(created_at.eq.${created},id.lt.${id})`,
      );
    }

    const { data, error } = await query;
    if (error) return bad(error.message, 500);

    const rows = data ?? [];
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    const items = page.map((r) => ({
      ...r,
      dest_url: r.destination_url ?? null, // keep UI alias
    }));

    const next_cursor =
      hasMore && page.length > 0
        ? encodeCursor(page[page.length - 1].created_at, page[page.length - 1].id)
        : null;

    return ok({ items, next_cursor });
  } catch (e: any) {
    return bad(e?.message || "Unexpected error", 500);
  }
}

export const dynamic = "force-dynamic";
export const runtime = "edge";
