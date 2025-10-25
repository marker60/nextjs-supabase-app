// /lib/supabase/client.ts
"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anon) {
  // Helpful in dev if envs are missing
  // eslint-disable-next-line no-console
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Singleton browser client (use in Client Components) */
export const supabaseBrowser: SupabaseClient = createSupabaseClient(url, anon);

/** Named export to satisfy `import { createClient }` callers */
export function createClient(): SupabaseClient {
  return supabaseBrowser;
}
