import { z } from "zod";
import { humanize } from "@/lib/gemini";
import { MAX_INPUT_CHARS } from "@/lib/limits";
import { createClient } from "@/lib/supabase/server";
import { TONE_IDS } from "@/lib/tones";

const body = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Paste some text first.")
    .max(MAX_INPUT_CHARS, `Text is too long (max ${MAX_INPUT_CHARS} characters).`),
  tone: z.enum(TONE_IDS),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Please log in." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const { text, tone } = parsed.data;

  let output: string;
  try {
    output = await humanize(text, tone);
  } catch (err) {
    console.error("Gemini error:", err);
    return Response.json(
      { error: "The AI service failed. Please try again." },
      { status: 502 },
    );
  }

  const { data, error } = await supabase
    .from("conversions")
    .insert({ user_id: user.id, tone, input_text: text, output_text: output })
    .select("id")
    .single();

  if (error) {
    // The user still gets their result even if saving history failed.
    console.error("Failed to save conversion:", error);
    return Response.json({ id: null, output, saved: false });
  }

  return Response.json({ id: data.id, output, saved: true });
}
