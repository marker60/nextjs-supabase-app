// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabaseServer";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();

  if (!data?.session) {
    // Not logged in → send to login
    redirect("/login");
  }

  const user = data.session.user;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600 dark:text-zinc-400">
        Welcome back{user?.email ? `, ${user.email}` : ""}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/brief"
          className="rounded-xl border p-4 transition-colors
                     bg-white hover:bg-gray-100
                     dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <div className="text-lg font-semibold">Your Briefs</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
            Create and manage briefs.
          </div>
        </a>

        <a
          href="/links"
          className="rounded-xl border p-4 transition-colors
                     bg-white hover:bg-gray-100
                     dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <div className="text-lg font-semibold">Links</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
            Shorten, edit, and track performance.
          </div>
        </a>
      </div>
    </main>
  );
}
