import { requireAdmin } from "@/lib/require-admin";
import { ImageTable } from "./image-table";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  const { supabase } = await requireAdmin();

  const { data: images } = await supabase
    .from("images")
    .select("id, url, alt_text, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Images</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Manage images ({images?.length ?? 0})
      </p>
      <ImageTable images={images ?? []} />
    </div>
  );
}
