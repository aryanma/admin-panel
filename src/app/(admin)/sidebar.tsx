"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/images", label: "Images" },
  { href: "/captions", label: "Captions" },
];

export function AdminSidebar({
  profile,
}: {
  profile: { email: string; first_name: string | null; last_name: string | null };
}) {
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h1 className="text-lg font-bold text-white">Crackd Admin</h1>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-zinc-800 px-4 py-4">
        <p className="truncate text-sm text-zinc-400">
          {profile.first_name} {profile.last_name}
        </p>
        <p className="truncate text-xs text-zinc-500">{profile.email}</p>
        <button
          onClick={handleSignOut}
          className="mt-3 w-full rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
