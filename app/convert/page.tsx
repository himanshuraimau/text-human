import type { Metadata } from "next";
import { Suspense } from "react";
import { Converter } from "@/components/converter";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Convert · Text Human" };

export default function ConvertPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Humanize text</h1>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <Guarded />
      </Suspense>
    </>
  );
}

// Reads the session, so it must sit behind Suspense with Cache Components.
async function Guarded() {
  await requireUser();
  return <Converter />;
}
