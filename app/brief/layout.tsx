// app/brief/layout.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabaseServer";

export default async function BriefSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  if (!data?.session) redirect("/login");

  return <>{children}</>;
}
