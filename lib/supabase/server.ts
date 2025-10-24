// /lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type SupabaseClient } from "@supabase/ssr";
import { createClient as createAdminClient, type SupabaseClient as AdminSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client bound to request cookies.
 * Use this for user-session work (auth.getUser, row-level security, etc.).
 */
export function createClient(): SupabaseClient {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

/**
 * Admin client (Service Role).
 * Use this ONLY in server code (e.g., route handlers) for privileged ops that bypass RLS.
 * Never import this into client components.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  // Throw synchronously so misconfig is obvious during build
  // (Service Role is required anywhere supabaseAdmin is used).
  // If your build runs on Vercel, set these env vars in Project Settings.
  // NEXT_PUBLIC_SUPABASE_URL
  // SUPABASE_SERVICE_ROLE
}

export const supabaseAdmin: AdminSupabaseClient = createAdminClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "affiflow-admin",
      },
    },
  }
);
