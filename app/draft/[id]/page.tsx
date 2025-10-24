// [FILE: app/draft/[id]/page.tsx]
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";  // Correct import

type DraftRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default async function DraftPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Call supabaseAdmin() to get the actual Supabase client
  const admin = supabaseAdmin();

  // Fetch draft data based on ID
  const { data, error } = await admin
    .from("drafts")
    .select("id, title, content, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return notFound(); // Handle the case if no draft is found
  }

  const draft: DraftRow = data;

  return (
    <div>
      <h1>{draft.title}</h1>
      <p>{draft.content}</p>
      <p>Created on: {new Date(draft.created_at).toLocaleDateString()}</p>
      <Link href="/drafts">Back to Drafts</Link>
    </div>
  );
}
