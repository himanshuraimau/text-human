"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; nothing useful to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-card"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
