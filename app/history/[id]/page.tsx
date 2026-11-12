import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteConversion } from "@/app/actions/history";
import { CopyButton } from "@/components/copy-button";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toneLabel } from "@/lib/tones";

export const metadata: Metadata = { title: "Conversion · Text Human" };

export default function ConversionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <Link href="/history" className="mb-4 text-sm text-muted hover:text-foreground">
        ← Back to history
      </Link>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <Conversion params={params} />
      </Suspense>
    </>
  );
}

async function Conversion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversions")
    .select("id, tone, input_text, output_text, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {toneLabel(data.tone)} ·{" "}
          {new Date(data.created_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "UTC",
          })}{" "}
          UTC
        </p>
        <form action={deleteConversion}>
          <input type="hidden" name="id" value={data.id} />
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline dark:text-red-400"
          >
            Delete
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Original</h2>
          <div className="whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-sm">
            {data.input_text}
          </div>
        </section>
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Human version</h2>
            <CopyButton text={data.output_text} />
          </div>
          <div className="whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-sm">
            {data.output_text}
          </div>
        </section>
      </div>
    </div>
  );
}
