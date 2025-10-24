// [FILE: components/nav.tsx]
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabaseAdmin } from "@/lib/supabase/server";  // Correct import

// Server action: sign out then go home
async function signOutAction() {
  // Call supabaseAdmin() to get the actual Supabase client
  const admin = supabaseAdmin();
  
  // Perform the sign-out action
  await admin.auth.signOut();

  // Redirect to home page after sign-out
  redirect("/");
}

export default function Nav() {
  return (
    <nav>
      <Button onClick={signOutAction}>Sign Out</Button>
    </nav>
  );
}
