import { requireAdmin } from "@/lib/require-admin";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function HumorFlavorStepsPage({
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
      .from("humor_flavor_steps")
      .select("id, humor_flavor_id, order_by, description, llm_model_id, llm_temperature, created_datetime_utc")
      .order("humor_flavor_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("humor_flavor_steps").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Humor Flavor Steps</h1>
      <p className="mt-1 text-sm text-zinc-400">All flavor steps ({count ?? 0})</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Flavor ID</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Model ID</th>
              <th className="px-4 py-3 font-medium">Temperature</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows?.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 text-zinc-400">{r.id}</td>
                <td className="px-4 py-3 text-zinc-300">{r.humor_flavor_id}</td>
                <td className="px-4 py-3 text-zinc-300">{r.order_by}</td>
                <td className="max-w-xs truncate px-4 py-3 text-white">{r.description ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-300">{r.llm_model_id}</td>
                <td className="px-4 py-3 text-zinc-300">{r.llm_temperature ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)} basePath="/humor-flavor-steps" />
    </div>
  );
}
