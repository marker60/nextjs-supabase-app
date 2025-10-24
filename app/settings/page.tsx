// /app/settings/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { AffiliateAccountsSchema } from "../../lib/validation/affiliate";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("affiliate_accounts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  async function save(formData: FormData) {
    "use server";
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const input = {
      amazon_tag: formData.get("amazon_tag")?.toString() ?? "",
      ebay_campid: formData.get("ebay_campid")?.toString() ?? "",
      cj_pid: formData.get("cj_pid")?.toString() ?? "",
      shareasale_affiliate_id:
        formData.get("shareasale_affiliate_id")?.toString() ?? "",
      other_raw: formData.get("other")?.toString() ?? "",
    };

    const parsed = AffiliateAccountsSchema.safeParse(input);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => i.message).join("; ");
      throw new Error(`Invalid settings: ${details}`);
    }

    const payload = {
      user_id: user.id,
      amazon_tag: parsed.data.amazon_tag || null,
      ebay_campid: parsed.data.ebay_campid || null,
      cj_pid: parsed.data.cj_pid || null,
      shareasale_affiliate_id: parsed.data.shareasale_affiliate_id || null,
      other: parsed.data.other ?? null,
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
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Amazon Associates Tag
          </label>
          <input
            name="amazon_tag"
            defaultValue={existing?.amazon_tag ?? ""}
            placeholder="yourtag-20"
            className="w-full rounded-md border px-3 py-2"
          />
          <p className="text-xs opacity-70">
            Example: <code>yourtag-20</code>
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">eBay CampID</label>
          <input
            name="ebay_campid"
            defaultValue={existing?.ebay_campid ?? ""}
            placeholder="5338XXXXXX"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">CJ PID</label>
          <input
            name="cj_pid"
            defaultValue={existing?.cj_pid ?? ""}
            placeholder="1234567"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            ShareASale Affiliate ID
          </label>
          <input
            name="shareasale_affiliate_id"
            defaultValue={existing?.shareasale_affiliate_id ?? ""}
            placeholder="1234567"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Other networks (optional)
          </label>
          <textarea
            name="other"
            defaultValue={
              existing?.other
                ? Object.entries(existing.other as Record<string, string>)
                    .map(([k, v]) => `${k}=${v}`)
                    .join("\n")
                : ""
            }
            placeholder={`network_key=value\nimpact_partnerId=12345`}
            rows={5}
            className="w-full rounded-md border px-3 py-2 font-mono text-sm"
          />
          <p className="text-xs opacity-70">
            One per line as <code>key=value</code>.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
