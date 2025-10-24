// /app/settings/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("affiliate_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  async function save(formData: FormData) {
    "use server";
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const payload = {
      user_id: user.id,
      amazon_tag: (formData.get("amazon_tag") as string | null) || null,
      ebay_campid: (formData.get("ebay_campid") as string | null) || null,
      cj_pid: (formData.get("cj_pid") as string | null) || null,
      shareasale_affiliate_id: (formData.get("shareasale_affiliate_id") as string | null) || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("affiliate_accounts")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;
    revalidatePath("/settings");
    redirect("/settings");
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Affiliate Accounts</h1>
      <form action={save} className="space-y-5">
        <div>
          <label className="block text-sm font-medium">Amazon Associates Tag</label>
          <input name="amazon_tag" defaultValue={existing?.amazon_tag ?? ""} className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">eBay CampID</label>
          <input name="ebay_campid" defaultValue={existing?.ebay_campid ?? ""} className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">CJ PID</label>
          <input name="cj_pid" defaultValue={existing?.cj_pid ?? ""} className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">ShareASale Affiliate ID</label>
          <input name="shareasale_affiliate_id" defaultValue={existing?.shareasale_affiliate_id ?? ""} className="w-full rounded-md border px-3 py-2" />
        </div>
        <button type="submit" className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black">Save</button>
      </form>
    </div>
  );
}
