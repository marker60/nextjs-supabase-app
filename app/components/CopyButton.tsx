"use client";
import * as React from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  async function onCopy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false), 1000); } catch {}
  }
  return (
    <button type="button" onClick={onCopy} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60" title={label}>
      {copied ? "Copied!" : label}
    </button>
  );
}
