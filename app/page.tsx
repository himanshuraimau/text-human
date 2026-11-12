import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Make AI text sound like a person wrote it
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Paste what ChatGPT, Gemini or any other AI gave you, pick a tone, and
        get a natural rewrite with the same meaning.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
