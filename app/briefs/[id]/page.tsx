export default function Page({ params }: { params: { id: string } }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Briefs (plural) – ID</h1>
      <pre>{params.id}</pre>
    </div>
  );
}
