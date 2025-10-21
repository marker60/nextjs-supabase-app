// app/brief/[id]/Toolbar.tsx
"use client";

import * as React from "react";

export default function Toolbar({ briefId }: { briefId: string }) {
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const onUpdate = (e: Event) => {
      setUpdatedAt(new Date());
    };
    window.addEventListener("links:updated", onUpdate as any);
    // first render timestamp
    setUpdatedAt(new Date());
    return () => window.removeEventListener("links:updated", onUpdate as any);
  }, [briefId]);

  const timeText =
    updatedAt != null
      ? updatedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" })
      : "—";

  return (
    <div className="rounded-xl border bg-gray-50 dark:bg-zinc-900/40 px-4 py-3 flex items-center justify-between">
      <div className="text-base font-semibold">Links</div>
      <div className="text-sm text-gray-600 dark:text-zinc-400">Updated {timeText}</div>
    </div>
  );
}
