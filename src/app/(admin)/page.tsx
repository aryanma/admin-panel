import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const [
    { count: userCount },
    { count: imageCount },
    { count: captionCount },
    { count: voteCount },
    { data: topCaptions },
    { data: recentImages },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .not("content", "is", null),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    supabase
      .from("captions")
      .select("id, content, image_id")
      .not("content", "is", null)
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("images")
      .select("id, url, image_description")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Total Users", value: userCount ?? 0 },
    { label: "Total Images", value: imageCount ?? 0 },
    { label: "Total Captions", value: captionCount ?? 0 },
    { label: "Total Votes", value: voteCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Overview of your Crackd platform
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold text-white">Recent Images</h2>
          {recentImages && recentImages.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {recentImages.map((img) => (
                <li
                  key={img.id}
                  className="flex items-center gap-3 rounded-md border border-zinc-800 p-2"
                >
                  <img
                    src={img.url}
                    alt={img.image_description || ""}
                    className="h-10 w-10 rounded object-cover"
                  />
                  <span className="truncate text-sm text-zinc-300">
                    {img.image_description || img.url}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No images yet.</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold text-white">Latest Captions</h2>
          {topCaptions && topCaptions.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {topCaptions.map((cap) => (
                <li
                  key={cap.id}
                  className="rounded-md border border-zinc-800 p-3"
                >
                  <p className="text-sm text-zinc-300">{cap.content}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Image #{cap.image_id}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No captions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
