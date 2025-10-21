"use client";

import * as React from "react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const btn = cn(
  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
  "bg-transparent text-gray-900 hover:bg-gray-100 hover:text-gray-900",
  "dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
);

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <button onClick={onCopy} className={btn} title={text}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
