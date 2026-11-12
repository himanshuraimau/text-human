"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function deleteConversion(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // RLS also guarantees a user can only delete their own rows.
  await supabase.from("conversions").delete().eq("id", id);

  revalidatePath("/history");
  redirect("/history");
}
