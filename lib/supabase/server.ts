// /lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type SupabaseClient } from "@supabase/ssr";

/** Cookie-bound server client (SSR, RLS enforced) */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) throw new Error("Missing SUPABASE env vars");

  const cookieStore = cookies();
  return createServerClient(url, anon, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, opts: any) => cookieStore.set({ name, value, ...opts }),
      remove: (name: string, opts: any) => cookieStore.set({ name, value: "", ...opts }),
    },
  });
}
