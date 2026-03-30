import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { supabase } = await requireAdmin();

  const [{ data: users }, { count }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, first_name, last_name, is_superadmin, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <p className="mt-1 text-sm text-zinc-400">
        All registered profiles ({count ?? users?.length ?? 0})
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Superadmin</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 text-white">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-4 py-3 text-zinc-300">{user.email}</td>
                <td className="px-4 py-3">
                  {user.is_superadmin ? (
                    <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs text-green-400">
                      Yes
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {user.created_datetime_utc
                    ? new Date(user.created_datetime_utc).toLocaleDateString()
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
