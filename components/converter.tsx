"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { MAX_INPUT_CHARS } from "@/lib/limits";
import { DEFAULT_TONE, TONES, type ToneId } from "@/lib/tones";

export function Converter() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [tone, setTone] = useState<ToneId>(DEFAULT_TONE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setOutput(data.output);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const overLimit = text.length > MAX_INPUT_CHARS;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="text" className="text-sm font-medium">
          AI text
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the AI-written text here…"
          rows={14}
          className="w-full resize-y rounded-md border border-border bg-card p-3 text-sm outline-none focus:border-accent"
        />
        <div
          className={`text-right text-xs ${overLimit ? "text-red-600" : "text-muted"}`}
        >
          {text.length} / {MAX_INPUT_CHARS}
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="tone" className="sr-only">
            Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as ToneId)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            {TONES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !text.trim() || overLimit}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
          >
            {loading ? "Humanizing…" : "Humanize"}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>

      <section className="flex flex-col gap-3" aria-live="polite">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Human version</h2>
          {output && <CopyButton text={output} />}
        </div>
        <div className="min-h-72 whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-sm">
          {loading ? (
            <span className="text-muted">Working on it…</span>
          ) : output ? (
            output
          ) : (
            <span className="text-muted">Your result will show up here.</span>
          )}
        </div>
      </section>
    </div>
  );
}
