# Text Human: Project Plan

## 1. Goal

A web app that takes AI-generated text (pasted by the user) and rewrites it so it reads like a real person wrote it, in a tone the user picks. Users sign in with email and password, and every conversion is saved to their history.

## 2. Decisions (from planning Q&A)

| Topic | Decision |
|---|---|
| Output style | User picks a tone from a dropdown (default: Casual) |
| Input | Pasted text only |
| Storage | Accounts plus a per-user history of conversions |
| Auth | Email + password only. No email verification, no password reset, no OAuth |
| Usage limits | None for now |
| Framework | Next.js 16 (App Router), TypeScript, Tailwind 4, bun |
| AI | Gemini API, called server-side only |
| Database and auth | Supabase (Postgres + Supabase Auth) |

## 3. Current state

- Next.js 16.4.6 app already scaffolded in `/home/himanshu/text-human` (default `app/page.tsx`, `layout.tsx`, `globals.css`).
- `.env` already has `GEMINI_API_KEY`.
- Supabase project not yet connected. No Supabase keys yet.
- `AGENTS.md` warns this Next.js version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing code (routing, route handlers, proxy/middleware, cookies).

## 4. Tech stack

- **Next.js 16** App Router, Server Components by default, Server Actions or Route Handlers for mutations.
- **Supabase**: `@supabase/supabase-js` and `@supabase/ssr` for cookie-based sessions in Next.js.
- **Gemini**: `@google/genai` SDK, called from a server route only. The key never reaches the browser.
- **Styling**: Tailwind CSS 4 (already installed).
- **Validation**: `zod` for request bodies.

## 5. Features (MVP)

1. **Sign up / Log in / Log out** with email and password.
2. **Convert page** (protected):
   - Textarea for the AI text.
   - Tone dropdown: Casual, Friendly, Professional, Simple (plain English). Editable list kept in one constant.
   - "Humanize" button, loading state, result panel with a Copy button.
3. **History page** (protected): list of past conversions (newest first), open one to see input and output, copy, delete.
4. **Landing page** (public): short pitch with links to sign up and log in.

### Out of scope for now

File or URL input, email verification, password reset, social login, usage limits, billing, AI-detector scoring.

## 6. Architecture

```
Browser
  |  (form submit)
  v
Next.js
  |- Route Handler  POST /api/humanize
  |     1. Read Supabase session from cookies, reject if not signed in (401)
  |     2. Validate body (text not empty, tone is an allowed value, length cap)
  |     3. Call Gemini with the tone-specific system prompt
  |     4. Insert the row into `conversions`
  |     5. Return { id, output }
  |
  |- Server Components  /history, /history/[id]  (read from Supabase via RLS)
  |- proxy (middleware)  refresh Supabase session, redirect unauthenticated users
  v
Supabase (Auth + Postgres)        Gemini API
```

Gemini is called only from the server. The browser never holds the Gemini key.

## 7. Database (Supabase Postgres)

Users live in Supabase's built-in `auth.users`. We add one table.

```sql
create table public.conversions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tone        text not null,
  input_text  text not null,
  output_text text not null,
  created_at  timestamptz not null default now()
);

create index conversions_user_created_idx
  on public.conversions (user_id, created_at desc);

alter table public.conversions enable row level security;

create policy "own rows: select" on public.conversions
  for select using (auth.uid() = user_id);
create policy "own rows: insert" on public.conversions
  for insert with check (auth.uid() = user_id);
create policy "own rows: delete" on public.conversions
  for delete using (auth.uid() = user_id);
```

Row Level Security means a user can only ever read, create or delete their own rows, even if app code has a bug.

For "no email verification", turn off **Confirm email** in Supabase: Authentication, Sign In / Providers, Email.

## 8. Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | public | Landing page |
| `/signup` | public | Create account |
| `/login` | public | Sign in |
| `/convert` | signed in | Main tool |
| `/history` | signed in | List of past conversions |
| `/history/[id]` | signed in | One conversion |
| `POST /api/humanize` | signed in | Calls Gemini and saves the result |

Signed-in users who visit `/login` or `/signup` get redirected to `/convert`.

## 9. Gemini prompt design

- Model: a Gemini Flash-class model (fast, cheap). Exact model id is read from an env var `GEMINI_MODEL` so it can change without code edits. Confirm the current id against the Gemini docs when we build this.
- System prompt (per tone) tells the model to:
  - keep the meaning and facts exactly the same,
  - vary sentence length, use contractions, avoid filler openers ("Certainly", "In conclusion", "delve", "tapestry"),
  - avoid em dashes, rigid lists and over-polished phrasing,
  - not add new claims,
  - return only the rewritten text, with no preamble.
- The user's text is passed as the content, never concatenated into the system prompt, to limit prompt injection.
- Input length cap (about 5,000 characters) enforced server-side to keep requests bounded, even though we have no per-user usage limits.

## 10. Environment variables

```
GEMINI_API_KEY=                      # already set, server only
GEMINI_MODEL=                        # optional override
NEXT_PUBLIC_SUPABASE_URL=            # needed
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # needed (anon key)
```

No Supabase service-role key is needed for the MVP because RLS covers all access.

## 11. Folder layout (planned)

```
app/
  page.tsx                 # landing
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  convert/page.tsx
  history/page.tsx
  history/[id]/page.tsx
  api/humanize/route.ts
lib/
  supabase/client.ts       # browser client
  supabase/server.ts       # server client (cookies)
  gemini.ts                # Gemini call and prompts
  tones.ts                 # tone list, single source of truth
proxy.ts                   # session refresh and route protection
supabase/
  schema.sql               # table and RLS from section 7
```

## 12. Build steps

1. Read the Next.js 16 docs in `node_modules/next/dist/docs/` (routing, route handlers, proxy, cookies).
2. Create the Supabase project, run `supabase/schema.sql`, turn off Confirm email, add the two env vars.
3. Install `@supabase/supabase-js`, `@supabase/ssr`, `@google/genai`, `zod`.
4. Build the Supabase clients and `proxy.ts` (session refresh and redirects).
5. Build signup, login and logout.
6. Build `lib/gemini.ts` and `POST /api/humanize` with validation, then test with a few real samples and tune the prompts.
7. Build the Convert page UI (textarea, tone dropdown, result, copy).
8. Build History list and detail pages, plus delete.
9. Landing page, basic responsive styling, error states (Gemini failure, empty input, expired session).
10. Run `bun run lint` and `bun run build`, then test the flow end to end in the browser.
11. (Optional) Deploy to Vercel and set the env vars there.

## 13. Risks and notes

- **Gemini quota and cost**: with no usage limits, one user could burn the quota. Add a per-user daily cap later if needed. The `conversions` table already makes that easy to count.
- **"Undetectable by AI detectors" is not promised.** The goal is better, more natural writing, not evasion of any particular tool.
- **Weak passwords**: Supabase's default minimum is 6 characters. Raise it in the Supabase dashboard if wanted.
- **No password reset** means a forgotten password locks the user out. Worth adding soon after the MVP.
- Next.js 16 differs from older versions. Check the bundled docs instead of relying on memory.

## 14. Open items before building

- Supabase project URL and anon key.
- Final list of tones.
- Confirm the Gemini model id to use.
