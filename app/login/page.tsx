// /app/login/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function signInAction(formData: FormData) {
  "use server";
  const supabase = createClient();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; notice?: string };
}) {
  const errorMsg = searchParams?.error;
  const notice = searchParams?.notice;

  return (
    <div className="min-h-[70vh] w-full grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border shadow-sm p-6 bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm opacity-75">Sign in to access your dashboard.</p>

        {notice ? (
          <div className="mt-4 rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
            {notice}
          </div>
        ) : null}

        {errorMsg ? (
          <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
            {errorMsg}
          </div>
        ) : null}

        <form action={signInAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ring-offset-0 ring-black/20 dark:ring-white/30 bg-white dark:bg-neutral-800 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="********"
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ring-offset-0 ring-black/20 dark:ring-white/30 bg-white dark:bg-neutral-800 text-black dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-black text-white py-2 font-medium hover:opacity-90 dark:bg-white dark:text-black"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm">
          New here?{" "}
          <Link href="/signup" className="underline hover:opacity-80">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
