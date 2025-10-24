// /app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-2">Please log in to view your dashboard.</p>
      </div>
    );
  }

  // Example: read back the user's affiliate record so we can prove data roundtrip
  const { data } = await supabase
    .from("affiliate_accounts")
    .select("amazon_tag, ebay_campid, cj_pid, shareasale_affiliate_id, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <pre className="mt-4 whitespace-pre-wrap rounded-md border p-4">
        {JSON.stringify({ user: user.email, affiliate_accounts: data ?? null }, null, 2)}
      </pre>
    </div>
  );
}
