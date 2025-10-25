// /app/signup/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<null | { type: "ok" | "err"; text: string }>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const { error } = await supabaseBrowser.auth.signUp({ email, password });

    if (error) {
      setMsg({ type: "err", text: error.message });
    } else {
      setMsg({
        type: "ok",
        text:
          "Account created. If email confirmation is enabled, check your inbox. You can now choose where to go.",
      });
    }

    setBusy(false);
  }

  return (
    <div className="min-h-[70vh] w-full grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border shadow-sm p-6 bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm opacity-75">
          Start tracking your affiliate links in minutes.
        </p>

        {msg && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              msg.type === "ok"
                ? "border-green-300 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-100"
                : "border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ring-offset-0 ring-black/20 dark:ring-white/30 bg-white dark:bg-neutral-800 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ring-offset-0 ring-black/20 dark:ring-white/30 bg-white dark:bg-neutral-800 text-black dark:text-white"
            />
          </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-black text-white py-2 font-medium hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {busy ? "Creating..." : "Create account"}
        </button>
        </form>

        {/* User-decides navigation: explicit links */}
        <div className="mt-4 grid gap-2">
          <Link href="/login" className="underline text-sm hover:opacity-80">
            Go to login
          </Link>
          <Link href="/dashboard" className="underline text-sm hover:opacity-80">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
