// /app/draft/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: { id: string } };

export default async function DraftPage({ params }: PageProps) {
  const { id } = params;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Draft</h1>
        <p className="mt-2 text-red-600">You must be logged in.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Draft</h1>
        <p className="mt-2 text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Draft</h1>
      <pre className="mt-4 whitespace-pre-wrap rounded-md border p-4">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
