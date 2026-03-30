import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { supabase } = await requireAdmin();

  const [{ data: captions }, { count }] = await Promise.all([
    supabase
      .from("captions")
      .select("id, content, image_id, created_datetime_utc")
      .not("content", "is", null)
      .order("created_datetime_utc", { ascending: false })
      .range(from, to),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .not("content", "is", null),
  ]);

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Captions</h1>
      <p className="mt-1 text-sm text-zinc-400">
        All generated captions ({totalCount})
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Caption</th>
              <th className="px-4 py-3 font-medium">Image ID</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {captions?.map((cap) => (
              <tr key={cap.id} className="hover:bg-zinc-900/50">
                <td className="max-w-md px-4 py-3 text-white">
                  {cap.content}
                </td>
                <td className="px-4 py-3 text-zinc-400">{cap.image_id}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {cap.created_datetime_utc
                    ? new Date(cap.created_datetime_utc).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/captions?page=${page - 1}`}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/captions?page=${page + 1}`}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
