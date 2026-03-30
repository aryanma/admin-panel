import { requireAdmin } from "@/lib/require-admin";
import { AdminSidebar } from "./sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <AdminSidebar profile={profile} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
