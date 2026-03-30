import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function CaptionsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: captions }, { count }] = await Promise.all([
    supabase
      .from("captions")
      .select("id, content, image_id, created_datetime_utc")
      .not("content", "is", null)
      .order("created_datetime_utc", { ascending: false }),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .not("content", "is", null),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Captions</h1>
      <p className="mt-1 text-sm text-zinc-400">
        All generated captions ({count ?? captions?.length ?? 0})
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
    </div>
  );
}
