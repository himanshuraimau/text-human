import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toneLabel } from "@/lib/tones";

export const metadata: Metadata = { title: "History · Text Human" };

export default function HistoryPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">History</h1>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <HistoryList />
      </Suspense>
    </>
  );
}

async function HistoryList() {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversions")
    .select("id, tone, input_text, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Could not load history. Check that the conversions table exists
        (supabase/schema.sql).
      </p>
    );
  }

  if (!data.length) {
    return (
      <p className="text-sm text-muted">
        Nothing here yet.{" "}
        <Link href="/convert" className="underline">
          Convert some text
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-card">
      {data.map((row) => (
        <li key={row.id}>
          <Link
            href={`/history/${row.id}`}
            className="flex flex-col gap-1 px-4 py-3 hover:bg-background"
          >
            <span className="line-clamp-2 text-sm">{row.input_text}</span>
            <span className="text-xs text-muted">
              {toneLabel(row.tone)} ·{" "}
              {new Date(row.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              })}{" "}
              UTC
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
