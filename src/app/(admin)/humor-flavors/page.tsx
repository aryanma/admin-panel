import { requireAdmin } from "@/lib/require-admin";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function HumorFlavorsPage({
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
      .from("humor_flavors")
      .select("id, slug, description, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Humor Flavors</h1>
      <p className="mt-1 text-sm text-zinc-400">All humor flavors ({count ?? 0})</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows?.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 text-zinc-400">{r.id}</td>
                <td className="px-4 py-3 text-white">{r.slug}</td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-300">{r.description}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)} basePath="/humor-flavors" />
    </div>
  );
}
