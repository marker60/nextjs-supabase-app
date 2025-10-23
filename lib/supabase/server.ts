// [FILE: lib/supabase/server.ts]
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return supabaseCreateClient(supabaseUrl, supabaseAnon);
}
