// app/brief/[id]/page.tsx
import Toolbar from "./Toolbar";
import LinksPanel from "./LinksPanel";

type PageParams = { id: string };

export default async function BriefPage({ params }: { params: PageParams }) {
  const briefId = params.id;

  // Server component shell; child components handle client logic.
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <Toolbar briefId={briefId} />
      <LinksPanel briefId={briefId} />
    </main>
  );
}
