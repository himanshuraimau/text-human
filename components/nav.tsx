import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const linkClass = "text-sm text-muted hover:text-foreground transition-colors";

export async function Nav() {
  const user = isSupabaseConfigured() ? await getUser() : null;

  if (!user) {
    return (
      <nav className="flex items-center gap-4">
        <Link href="/login" className={linkClass}>
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
        >
          Sign up
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-4">
      <Link href="/convert" className={linkClass}>
        Convert
      </Link>
      <Link href="/history" className={linkClass}>
        History
      </Link>
      <form action={logout}>
        <button type="submit" className={linkClass}>
          Log out
        </button>
      </form>
    </nav>
  );
}
