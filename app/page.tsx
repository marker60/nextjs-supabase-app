// app/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./lib/supabaseServer";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.getSession();
  const session = data?.session ?? null;

  // If already logged in → go straight to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // Public landing for logged-out visitors
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="mt-3 text-gray-600 dark:text-zinc-400">
        Please log in or sign up to continue.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/login"
          className="rounded-lg border px-4 py-2 text-sm transition-colors
                     bg-transparent text-gray-900 hover:bg-gray-100 hover:text-gray-900
                     dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          Log in
        </a>
        <a
          href="/signup"
          className="rounded-lg border px-4 py-2 text-sm transition-colors
                     bg-transparent text-gray-900 hover:bg-gray-100 hover:text-gray-900
                     dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          Sign up
        </a>
      </div>
    </main>
  );
}
