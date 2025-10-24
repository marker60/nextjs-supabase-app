// app/api/links/stats/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server"; // client object (do not call)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");

  if (!id && !slug) {
    return NextResponse.json({ error: "Provide ?id= or ?slug=" }, { status: 400 });
  }

  const query = supabaseAdmin.from("links").select("*").limit(1);
  if (id) query.eq("id", id);
  if (slug) query.eq("slug", slug);

  const { data, error } = await query.single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ link: data }, { status: 200 });
}
