// [FILE: app/api/brief/list/route.ts]
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server"; // Import the admin client correctly

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Corrected: Call supabaseAdmin() to get the client instance
    const supabase = supabaseAdmin(); 

    const { data, error } = await supabase
      .from("briefs") // Now correctly using 'from' on the Supabase client instance
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
