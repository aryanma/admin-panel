"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

// ---------- Images ----------
export async function createImage(formData: FormData) {
  const { supabase, user } = await getUser();
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
  const { supabase, user } = await getUser();
  const id = formData.get("id") as string;
  const url = formData.get("url") as string;
  const additional_context = formData.get("additional_context") as string;
  const { error } = await supabase
    .from("images")
    .update({ url, additional_context: additional_context || null, modified_by_user_id: user.id })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/images");
  return { success: true };
}

export async function deleteImage(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/images");
  return { success: true };
}

// ---------- Terms ----------
export async function createTerm(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("terms").insert({
    term: formData.get("term") as string,
    definition: formData.get("definition") as string,
    example: (formData.get("example") as string) || null,
    priority: parseInt((formData.get("priority") as string) || "0", 10),
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/terms");
  return { success: true };
}

export async function updateTerm(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("terms")
    .update({
      term: formData.get("term") as string,
      definition: formData.get("definition") as string,
      example: (formData.get("example") as string) || null,
      priority: parseInt((formData.get("priority") as string) || "0", 10),
      modified_by_user_id: user.id,
    })
    .eq("id", formData.get("id") as string);
  if (error) return { error: error.message };
  revalidatePath("/terms");
  return { success: true };
}

export async function deleteTerm(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/terms");
  return { success: true };
}

// ---------- Caption Examples ----------
export async function createCaptionExample(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("caption_examples").insert({
    image_description: formData.get("image_description") as string,
    caption: formData.get("caption") as string,
    explanation: (formData.get("explanation") as string) || null,
    priority: parseInt((formData.get("priority") as string) || "0", 10),
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/caption-examples");
  return { success: true };
}

export async function updateCaptionExample(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("caption_examples")
    .update({
      image_description: formData.get("image_description") as string,
      caption: formData.get("caption") as string,
      explanation: (formData.get("explanation") as string) || null,
      priority: parseInt((formData.get("priority") as string) || "0", 10),
      modified_by_user_id: user.id,
    })
    .eq("id", formData.get("id") as string);
  if (error) return { error: error.message };
  revalidatePath("/caption-examples");
  return { success: true };
}

export async function deleteCaptionExample(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("caption_examples").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/caption-examples");
  return { success: true };
}

// ---------- LLM Providers ----------
export async function createLlmProvider(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("llm_providers").insert({
    name: formData.get("name") as string,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/llm-providers");
  return { success: true };
}

export async function updateLlmProvider(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("llm_providers")
    .update({ name: formData.get("name") as string, modified_by_user_id: user.id })
    .eq("id", formData.get("id") as string);
  if (error) return { error: error.message };
  revalidatePath("/llm-providers");
  return { success: true };
}

export async function deleteLlmProvider(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("llm_providers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/llm-providers");
  return { success: true };
}

// ---------- LLM Models ----------
export async function createLlmModel(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("llm_models").insert({
    name: formData.get("name") as string,
    llm_provider_id: parseInt(formData.get("llm_provider_id") as string, 10),
    provider_model_id: formData.get("provider_model_id") as string,
    is_temperature_supported: formData.get("is_temperature_supported") === "true",
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/llm-models");
  return { success: true };
}

export async function updateLlmModel(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("llm_models")
    .update({
      name: formData.get("name") as string,
      llm_provider_id: parseInt(formData.get("llm_provider_id") as string, 10),
      provider_model_id: formData.get("provider_model_id") as string,
      is_temperature_supported: formData.get("is_temperature_supported") === "true",
      modified_by_user_id: user.id,
    })
    .eq("id", formData.get("id") as string);
  if (error) return { error: error.message };
  revalidatePath("/llm-models");
  return { success: true };
}

export async function deleteLlmModel(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("llm_models").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/llm-models");
  return { success: true };
}

// ---------- Allowed Signup Domains ----------
export async function createAllowedDomain(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("allowed_signup_domains").insert({
    apex_domain: formData.get("apex_domain") as string,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/allowed-domains");
  return { success: true };
}

export async function updateAllowedDomain(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("allowed_signup_domains")
    .update({ apex_domain: formData.get("apex_domain") as string, modified_by_user_id: user.id })
    .eq("id", formData.get("id") as string);
  if (error) return { error: error.message };
  revalidatePath("/allowed-domains");
  return { success: true };
}

export async function deleteAllowedDomain(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("allowed_signup_domains").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/allowed-domains");
  return { success: true };
}

// ---------- Whitelisted Emails ----------
export async function createWhitelistedEmail(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("whitelist_email_addresses").insert({
    email_address: formData.get("email_address") as string,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/whitelisted-emails");
  return { success: true };
}

export async function updateWhitelistedEmail(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("whitelist_email_addresses")
    .update({ email_address: formData.get("email_address") as string, modified_by_user_id: user.id })
    .eq("id", formData.get("id") as string);
  if (error) return { error: error.message };
  revalidatePath("/whitelisted-emails");
  return { success: true };
}

export async function deleteWhitelistedEmail(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("whitelist_email_addresses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/whitelisted-emails");
  return { success: true };
}

// ---------- Humor Mix ----------
export async function updateHumorMix(formData: FormData) {
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("humor_flavor_mix")
    .update({
      caption_count: parseInt(formData.get("caption_count") as string, 10),
      modified_by_user_id: user.id,
    })
    .eq("id", formData.get("id") as string);
  if (error) return { error: error.message };
  revalidatePath("/humor-mix");
  return { success: true };
}
