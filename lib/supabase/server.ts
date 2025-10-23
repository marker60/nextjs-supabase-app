// [FILE: lib/supabase/server.ts]
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return supabaseCreateClient(supabaseUrl, supabaseAnon);
}

// [NEW] Export admin client with service key for privileged actions
export function supabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL!;  // Use service key URL if different
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;  // Secure service key

  return supabaseCreateClient(supabaseUrl, supabaseServiceRoleKey);
}
