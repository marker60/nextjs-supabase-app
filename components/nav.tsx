// /components/nav.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction() {
  "use server";
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function Nav() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold">AffiFlow</Link>
        <Link href="/dashboard" className="opacity-80 hover:opacity-100">Dashboard</Link>
        <Link href="/settings" className="opacity-80 hover:opacity-100">Settings</Link>
      </div>
      <form action={signOutAction}>
        <button className="rounded-md bg-black px-3 py-1.5 text-white dark:bg-white dark:text-black">Sign out</button>
      </form>
    </nav>
  );
}
