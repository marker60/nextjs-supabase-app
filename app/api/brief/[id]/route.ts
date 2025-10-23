// [FILE: app/api/brief/[id]/route.ts]
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server"; // import the admin client correctly

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Call supabaseAdmin to get the actual Supabase client
  const supabase = supabaseAdmin();  // Corrected: Call the function to get the client instance

  const { data, error } = await supabase
    .from("briefs")
    .select("id, title, created_at")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
