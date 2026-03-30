import { requireAdmin } from "@/lib/require-admin";
import { CrudTable } from "../crud-table";
import { createLlmProvider, updateLlmProvider, deleteLlmProvider } from "@/app/actions";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function LlmProvidersPage({
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
      .from("llm_providers")
      .select("id, name, created_datetime_utc")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("llm_providers").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">LLM Providers</h1>
      <p className="mt-1 text-sm text-zinc-400">Manage LLM providers ({count ?? 0})</p>
      <CrudTable
        rows={(rows ?? []) as Record<string, unknown>[]}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name", editable: true },
          { key: "created_datetime_utc", label: "Created" },
        ]}
        createAction={createLlmProvider}
        updateAction={updateLlmProvider}
        deleteAction={deleteLlmProvider}
        entityName="Provider"
      />
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)} basePath="/llm-providers" />
    </div>
  );
}
