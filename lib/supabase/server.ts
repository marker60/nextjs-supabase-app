// /lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Cookie-bound server client (SSR, RLS enforced) */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) throw new Error("Missing SUPABASE env vars");

  const cookieStore = cookies();

  return createServerClient(url, anon, {
    cookies: {
      // Read all cookies for this request
      getAll() {
        return cookieStore.getAll();
      },
      // Write/overwrite cookies for this response
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  }) as unknown as SupabaseClient;
}
