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
  const started = Date.now();
  const slug = (ctx.params?.slug || "").trim();

  // 1) Find the link
  const { data: link, error: linkErr } = await supabaseAdmin
    .from("links")
    .select("id, destination_url")
    .eq("slug", slug)
    .single();

  if (linkErr || !link) {
    // Soft 404 to home if slug not found
    return NextResponse.redirect(new URL("/", req.url), { status: 302 });
  }

  // Collect request context (best-effort)
  const ip =
    // Vercel
    (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
    // Node fallback
    undefined;

  const ua = req.headers.get("user-agent") || null;
  const referer = req.headers.get("referer") || null;
  const ip_hash = hashIp(ip);

  // 2) Insert click (best-effort; don’t block redirect)
  try {
    const { error: clickErr } = await supabaseAdmin.from("clicks").insert({
      link_id: link.id,
      ip_hash,
      ua,
      referer,
    });
    if (clickErr) {
      // You can log this to Vercel runtime logs when debugging:
      // console.error("click insert error:", clickErr.message);
    }
  } catch {
    // swallow errors so redirect still happens
  }

  // 3) Redirect to destination
  const dest = link.destination_url || "/";
  const res = NextResponse.redirect(dest, 302);

  // conservative caching to avoid double counting by caches
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-AffiFlow-Redirect", "1");
  res.headers.set("X-RTT", String(Date.now() - started));
  return res;
}
