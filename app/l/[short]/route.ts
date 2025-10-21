// app/l/[short]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function bad(status: number, msg: string) {
  return new NextResponse(msg, { status });
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(req: Request, { params }: { params: { short: string } }) {
  const code = params?.short || "";
  if (!code) return bad(400, "Missing code");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) return bad(500, "Missing Supabase env");

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("links")
    .select("id, destination_url, clicks")
    .or(`slug.eq.${code},short_id.eq.${code}`)
    .limit(1)
    .maybeSingle();

  if (error) return bad(500, error.message);
  if (!data || !data.destination_url) return bad(404, "Not found");

  // Non-blocking updates: increment counters + log click
  (async () => {
    try {
      // Derive lightweight fields
      const headers = new Headers(req.headers);
      const xff = headers.get("x-forwarded-for") || "";
      const ip = xff.split(",")[0].trim() || "";
      const ua = headers.get("user-agent") || null;
      const referer = headers.get("referer") || null;

      let ip_hash: string | null = null;
      const secret = process.env.LINK_IP_HASH_SECRET || "";
      if (ip && secret) ip_hash = await sha256Hex(`${secret}:${ip}`);

      // 1) increment clicks
      await supabase
        .from("links")
        .update({ clicks: (data.clicks ?? 0) + 1, last_click_at: new Date().toISOString() })
        .eq("id", data.id);

      // 2) insert click log
      await supabase.from("clicks_log").insert({
        link_id: data.id,
        referer,
        ua,
        ip_hash,
      });
    } catch {
      // ignore failures; redirect should still succeed
    }
  })();

  return NextResponse.redirect(data.destination_url, 308);
}

export const dynamic = "force-dynamic";
export const runtime = "edge";
