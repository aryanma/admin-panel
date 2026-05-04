"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/caption-stats", label: "Caption Stats" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/users", label: "Users" },
      { href: "/images", label: "Images" },
      { href: "/captions", label: "Captions" },
      { href: "/caption-requests", label: "Caption Requests" },
      { href: "/caption-examples", label: "Caption Examples" },
    ],
  },
  {
    label: "Humor",
    items: [
      { href: "/humor-flavors", label: "Humor Flavors" },
      { href: "/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/humor-mix", label: "Humor Mix" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    label: "LLM",
    items: [
      { href: "/llm-providers", label: "LLM Providers" },
      { href: "/llm-models", label: "LLM Models" },
      { href: "/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/llm-responses", label: "LLM Responses" },
    ],
  },
  {
    label: "Access",
    items: [
      { href: "/allowed-domains", label: "Allowed Domains" },
      { href: "/whitelisted-emails", label: "Whitelisted Emails" },
    ],
  },
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
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 overflow-y-auto">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h1 className="text-lg font-bold text-white">Crackd Admin</h1>
      </div>
      <nav className="flex-1 px-3 py-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "bg-zinc-800 font-medium text-white"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-zinc-800 px-4 py-3">
        <p className="truncate text-sm text-zinc-400">
          {profile.first_name} {profile.last_name}
        </p>
        <p className="truncate text-xs text-zinc-500">{profile.email}</p>
        <button
          onClick={handleSignOut}
          className="mt-2 w-full rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
