"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const url = formData.get("url") as string;
  const alt_text = formData.get("alt_text") as string;

  const { error } = await supabase.from("images").insert({
    url,
    alt_text: alt_text || null,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/images");
  return { success: true };
}

export async function updateImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;
  const url = formData.get("url") as string;
  const alt_text = formData.get("alt_text") as string;

  const { error } = await supabase
    .from("images")
    .update({
      url,
      alt_text: alt_text || null,
      modified_by_user_id: user.id,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/images");
  return { success: true };
}

export async function deleteImage(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/images");
  return { success: true };
}
