import { requireAdmin } from "@/lib/require-admin";
import { CrudTable } from "../crud-table";
import { createLlmModel, updateLlmModel, deleteLlmModel } from "@/app/actions";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function LlmModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: p } = await searchParams;
  const page = Math.max(1, parseInt(p || "1", 10));
  const from = (page - 1) * PAGE_SIZE;

  const { supabase } = await requireAdmin();
  const [{ data: rows }, { count }, { data: providers }] = await Promise.all([
    supabase
      .from("llm_models")
      .select("id, name, llm_provider_id, provider_model_id, is_temperature_supported, created_datetime_utc")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("llm_models").select("*", { count: "exact", head: true }),
    supabase.from("llm_providers").select("id, name").order("id", { ascending: true }),
  ]);

  const providerOptions = (providers ?? []).map((p) => ({
    value: String(p.id),
    label: p.name,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">LLM Models</h1>
      <p className="mt-1 text-sm text-zinc-400">Manage LLM models ({count ?? 0})</p>
      <CrudTable
        rows={(rows ?? []) as Record<string, unknown>[]}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name", editable: true },
          { key: "llm_provider_id", label: "Provider", editable: true, type: "select", options: providerOptions },
          { key: "provider_model_id", label: "Model ID", editable: true },
          { key: "is_temperature_supported", label: "Temp Support", editable: true, type: "boolean" },
        ]}
        createAction={createLlmModel}
        updateAction={updateLlmModel}
        deleteAction={deleteLlmModel}
        entityName="Model"
      />
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)} basePath="/llm-models" />
    </div>
  );
}
