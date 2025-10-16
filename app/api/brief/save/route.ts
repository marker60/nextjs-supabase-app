// [LABEL: FILE] app/api/brief/save/route.ts
// [LABEL: PURPOSE] Update an existing brief's title (no schema changes).
// [LABEL: NOTES] Uses service-role in preview envs per your current setup.

// [LABEL: IMPORTS]
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// [LABEL: UTILS] Basic UUID guard (keeps current schema assumptions)
const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export async function POST(req: Request) {
  try {
    // [LABEL: INPUT] Expect { id: string (uuid), title: string }
    const { id, title } = await req.json().catch(() => ({} as any));

    if (!id || !isUuid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid or missing id (uuid expected)" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
    }

    // [LABEL: ENV] Service role for server-to-DB write
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) {
      return NextResponse.json({ ok: false, error: "Missing Supabase env vars" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    // [LABEL: DB] Update title only (schema: briefs(id uuid pk, title text, created_at timestamptz))
    const { error } = await supabase.from("briefs").update({ title }).eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id, title });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
