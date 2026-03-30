import { createClient } from "./supabase-server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) redirect("/unauthorized");

  return { supabase, user, profile };
}
