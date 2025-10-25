// /app/dashboard/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 opacity-80">
          Please <Link href="/login" className="underline">sign in</Link> to view your dashboard.
        </p>
      </div>
    );
  }

  const { data: settings } = await supabase
    .from("affiliate_accounts")
    .select("amazon_tag, ebay_campid, cj_pid, shareasale_affiliate_id, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasAny =
    !!settings?.amazon_tag ||
    !!settings?.ebay_campid ||
    !!settings?.cj_pid ||
    !!settings?.shareasale_affiliate_id;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Welcome, {user.email}</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Earnings (prototype)</h2>
          <p className="mt-2 text-sm opacity-75">
            Earnings, clicks, and conversions will appear here after we wire networks.
          </p>
          <div className="mt-4 rounded-md bg-neutral-100 dark:bg-neutral-800 p-4">
            <div className="text-3xl font-bold">$0.00</div>
            <div className="text-xs opacity-75">Today</div>
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Affiliate Accounts</h2>

          {!hasAny ? (
            <div className="mt-2 text-sm opacity-75">
              No affiliate IDs added yet.
              <div className="mt-3">
                <Link href="/settings" className="inline-block rounded-md bg-black text-white px-3 py-1.5 text-sm hover:opacity-90 dark:bg-white dark:text-black">
                  Add your IDs in Settings
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-3 text-sm">
              {settings?.amazon_tag ? <li>Amazon: <b>{settings.amazon_tag}</b></li> : null}
              {settings?.ebay_campid ? <li>eBay: <b>{settings.ebay_campid}</b></li> : null}
              {settings?.cj_pid ? <li>CJ: <b>{settings.cj_pid}</b></li> : null}
              {settings?.shareasale_affiliate_id ? <li>ShareASale: <b>{settings.shareasale_affiliate_id}</b></li> : null}
              <li className="mt-2 text-xs opacity-60">
                {settings?.updated_at ? `Last updated: ${new Date(settings.updated_at).toLocaleString()}` : ""}
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
