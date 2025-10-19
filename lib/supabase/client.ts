// [LABEL: FILE] lib/supabase/client.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL");
if (!anon) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_ANON_KEY");

// shared singleton
export const supabase = createSupabaseClient(url, anon);

// zero-arg back-compat
export function createClient() {
  return supabase;
}

// optional raw 2-arg factory if ever needed
export const createRawClient = createSupabaseClient;

// back-compat alias
export function getSupabaseClient() {
  return supabase;
}
