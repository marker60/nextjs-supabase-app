// app/api/links/stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");

  if (!id && !slug) {
    return NextResponse.json({ error: "Provide ?id= or ?slug=" }, { status: 400 });
  }

  let query = supabase.from("links").select("*").limit(1);
  if (id) query = query.eq("id", id);
  if (slug) query = query.eq("slug", slug);

  const { data, error } = await query.single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ link: data }, { status: 200 });
}
