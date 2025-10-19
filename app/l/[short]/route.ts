// app/l/[short]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request, { params }: { params:{ short:string } }) {
  const short = params?.short?.trim();
  if (!short) return NextResponse.redirect(new URL("/", req.url));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) return new NextResponse("Missing Supabase env", { status:500 });

  const supabase = createClient(url, serviceKey, { auth:{ persistSession:false } });

  const { data, error } = await supabase
    .from("links")
    .select("id, destination_url, clicks")
    .or(`short_id.eq.${short},slug.eq.${short}`)
    .maybeSingle();

  if (error || !data) return new NextResponse("Not found", { status:404 });

  await supabase
    .from("links")
    .update({ clicks:(data.clicks??0)+1, last_click_at:new Date().toISOString() })
    .eq("id", data.id);

  // redirect to destination_url
  return NextResponse.redirect(data.destination_url, { status:302 });
}
