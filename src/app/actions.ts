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
  const additional_context = formData.get("additional_context") as string;

  const { error } = await supabase.from("images").insert({
    url,
    additional_context: additional_context || null,
    profile_id: user.id,
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
  const additional_context = formData.get("additional_context") as string;

  const { error } = await supabase
    .from("images")
    .update({
      url,
      additional_context: additional_context || null,
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
