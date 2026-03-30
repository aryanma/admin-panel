import { requireAdmin } from "@/lib/require-admin";
import { CrudTable } from "../crud-table";
import { updateHumorMix } from "@/app/actions";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function HumorMixPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: p } = await searchParams;
  const page = Math.max(1, parseInt(p || "1", 10));
  const from = (page - 1) * PAGE_SIZE;

  const { supabase } = await requireAdmin();
  const [{ data: rows }, { count }] = await Promise.all([
    supabase
      .from("humor_flavor_mix")
      .select("id, humor_flavor_id, caption_count, created_datetime_utc")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("humor_flavor_mix").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Humor Mix</h1>
      <p className="mt-1 text-sm text-zinc-400">Flavor mix configuration ({count ?? 0})</p>
      <CrudTable
        rows={(rows ?? []) as Record<string, unknown>[]}
        columns={[
          { key: "id", label: "ID" },
          { key: "humor_flavor_id", label: "Flavor ID" },
          { key: "caption_count", label: "Caption Count", editable: true, type: "number" },
          { key: "created_datetime_utc", label: "Created" },
        ]}
        updateAction={updateHumorMix}
        entityName="Mix Entry"
      />
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)} basePath="/humor-mix" />
    </div>
  );
}
