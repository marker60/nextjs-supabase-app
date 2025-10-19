// app/api/links/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helpers
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

function isHttpUrl(u: string) {
  return /^https?:\/\//i.test(u);
}
function isValidSlug(s: string) {
  // 3–32 chars: letters, numbers, dash, underscore
  return /^[a-zA-Z0-9_-]{3,32}$/.test(s);
}

function mapOut(row: any) {
  // API returns both DB column and UI-friendly alias
  return {
    ...row,
    dest_url: row.destination_url ?? null,
  };
}

function sbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing Supabase env");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Reject GET explicitly (we only support PATCH/DELETE here)
export async function GET() {
  return bad("Method Not Allowed", 405);
}

// Update: { dest_url?: string, slug?: string }
export async function PATCH(_req: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params?.id;
    if (!id) return bad("id required");
    const body = await _req.json().catch(() => ({}));
    const dest_url = body?.dest_url as string | undefined;
    const slug = (body?.slug as string | undefined)?.trim();

    if (!dest_url && !slug) {
      return bad("No fields to update");
    }
    if (dest_url && !isHttpUrl(dest_url)) {
      return bad("dest_url must start with http(s)://");
    }
    if (slug && !isValidSlug(slug)) {
      return bad("slug must be 3–32 chars [A–Z, a–z, 0–9, -, _]");
    }

    const supabase = sbClient();

    // If slug provided, check uniqueness (other than this id)
    if (slug) {
      const { data: conflict, error: conflictErr } = await supabase
        .from("links")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .limit(1);
      if (conflictErr) return bad(conflictErr.message, 500);
      if ((conflict ?? []).length > 0) {
        return bad("slug is already in use. Try another.");
      }
    }

    // Build patch
    const patch: Record<string, any> = {};
    if (dest_url) patch.destination_url = dest_url;
    if (slug !== undefined) patch.slug = slug.length ? slug : null; // allow clearing slug

    const { data, error } = await supabase
      .from("links")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) return bad(error.message, 500);
    if (!data) return bad("Not found", 404);

    return ok({ item: mapOut(data) });
  } catch (e: any) {
    return bad(e?.message || "Unexpected error", 500);
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params?.id;
    if (!id) return bad("id required");

    const supabase = sbClient();
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) return bad(error.message, 500);
    return ok({});
  } catch (e: any) {
    return bad(e?.message || "Unexpected error", 500);
  }
}

// Everything else → 405
export const dynamic = "force-dynamic";
export const runtime = "edge";
