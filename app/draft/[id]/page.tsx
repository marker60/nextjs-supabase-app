// app/draft/[id]/page.tsx
import { supabaseAdmin } from "@/lib/supabase/server"; // client object (do not call)

type PageProps = { params: { id: string } };

export default async function DraftPage({ params }: PageProps) {
  const { id } = params;

  const { data, error } = await supabaseAdmin
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
