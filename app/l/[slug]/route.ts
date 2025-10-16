// [LABEL: FILE] app/l/[slug]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashIp(ip: string | null | undefined) {
  const secret = process.env.LINK_IP_HASH_SECRET || "";
  const val = (ip || "0.0.0.0") + "|" + secret;
  return crypto.createHash("sha256").update(val).digest("hex").slice(0, 32);
}

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  const t0 = Date.now();
  const slug = (ctx.params?.slug || "").trim();

  // 1) Lookup link
  const { data: link, error: linkErr } = await supabaseAdmin
    .from("links")
    .select("id, destination_url")
    .eq("slug", slug)
    .single();

  if (linkErr || !link) {
    const res404 = NextResponse.redirect(new URL("/", req.url), { status: 302 });
    res404.headers.set("Cache-Control", "no-store");
    res404.headers.set("X-AffiFlow-Redirect", "miss");
    res404.headers.set("X-Click-Status", "link-not-found");
    res404.headers.set("X-RTT", String(Date.now() - t0));
    return res404;
  }

  // 2) Prepare click fields
  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || undefined;
  const ua = req.headers.get("user-agent") || null;
  const referer = req.headers.get("referer") || null;
  const ip_hash = hashIp(ip);

  // 3) Insert click (best-effort, but we expose status in headers)
  let clickStatus = "ok";
  let clickError: string | null = null;

  try {
    const { error: clickErr } = await supabaseAdmin.from("clicks").insert({
      link_id: link.id,
      ip_hash,
      ua,
      referer,
    });
    if (clickErr) {
      clickStatus = "error";
      clickError = clickErr.message ?? String(clickErr);
      // Log to Vercel runtime logs so you can see it from the UI
      console.error("[/l/[slug]] click insert error:", clickError);
    }
  } catch (e: any) {
    clickStatus = "error";
    clickError = e?.message ?? "unknown error";
    console.error("[/l/[slug]] click insert exception:", clickError);
  }

  // 4) Redirect
  const dest = link.destination_url || "/";
  const res = NextResponse.redirect(dest, 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-AffiFlow-Redirect", "1");
  res.headers.set("X-Click-Status", clickStatus);
  if (clickError) res.headers.set("X-Click-Error", clickError.slice(0, 200));
  res.headers.set("X-RTT", String(Date.now() - t0));
  return res;
}
