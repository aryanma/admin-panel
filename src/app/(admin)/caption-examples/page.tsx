import { requireAdmin } from "@/lib/require-admin";
import { CrudTable } from "../crud-table";
import { createCaptionExample, updateCaptionExample, deleteCaptionExample } from "@/app/actions";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function CaptionExamplesPage({
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
      .from("caption_examples")
      .select("id, image_description, caption, explanation, priority")
      .order("priority", { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("caption_examples").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Caption Examples</h1>
      <p className="mt-1 text-sm text-zinc-400">Example captions for LLM training ({count ?? 0})</p>
      <CrudTable
        rows={(rows ?? []) as Record<string, unknown>[]}
        columns={[
          { key: "id", label: "ID" },
          { key: "image_description", label: "Image Desc", editable: true },
          { key: "caption", label: "Caption", editable: true },
          { key: "explanation", label: "Explanation", editable: true },
          { key: "priority", label: "Priority", editable: true, type: "number" },
        ]}
        createAction={createCaptionExample}
        updateAction={updateCaptionExample}
        deleteAction={deleteCaptionExample}
        entityName="Caption Example"
      />
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)} basePath="/caption-examples" />
    </div>
  );
}
