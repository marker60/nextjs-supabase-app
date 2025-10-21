// app/lib/supabaseServer.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client for App Router.
 * Reads/writes auth cookies so we can check session in server components/layouts.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  // NOTE: In some RSC contexts, setting cookies may no-op; that's OK for reads.
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // ignore if not allowed in this render phase
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options, expires: new Date(0) });
        } catch {
          // ignore if not allowed in this render phase
        }
      },
    },
  });
}
