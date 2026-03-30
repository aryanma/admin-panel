import { requireAdmin } from "@/lib/require-admin";
import { CrudTable } from "../crud-table";
import { createTerm, updateTerm, deleteTerm } from "@/app/actions";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function TermsPage({
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
      .from("terms")
      .select("id, term, definition, example, priority, term_type_id")
      .order("priority", { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("terms").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Terms</h1>
      <p className="mt-1 text-sm text-zinc-400">Slang/humor terms ({count ?? 0})</p>
      <CrudTable
        rows={(rows ?? []) as Record<string, unknown>[]}
        columns={[
          { key: "id", label: "ID" },
          { key: "term", label: "Term", editable: true },
          { key: "definition", label: "Definition", editable: true },
          { key: "example", label: "Example", editable: true },
          { key: "priority", label: "Priority", editable: true, type: "number" },
          { key: "term_type_id", label: "Type ID" },
        ]}
        createAction={createTerm}
        updateAction={updateTerm}
        deleteAction={deleteTerm}
        entityName="Term"
      />
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)} basePath="/terms" />
    </div>
  );
}
