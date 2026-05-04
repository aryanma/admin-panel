import { requireAdmin } from "@/lib/require-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

interface Vote {
  caption_id: string;
  vote_value: number;
  profile_id: string;
}

interface CaptionRow {
  id: string;
  content: string | null;
  image_id: string | null;
  is_public: boolean;
  profile_id: string | null;
  created_datetime_utc: string;
}

interface ImageRow {
  id: string;
  url: string;
  image_description: string | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

async function fetchAll<T>(
  supabase: SupabaseClient,
  table: string,
  select: string,
): Promise<T[]> {
  const out: T[] = [];
  const batch = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + batch - 1);
    if (error || !data || data.length === 0) break;
    out.push(...(data as T[]));
    if (data.length < batch) break;
    from += batch;
  }
  return out;
}

export default async function CaptionStatsPage() {
  const { supabase } = await requireAdmin();

  const [
    { count: totalCaptions },
    { count: publicCaptions },
    { count: privateCaptions },
    { count: totalVotes },
    votes,
  ] = await Promise.all([
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .not("content", "is", null),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true)
      .not("content", "is", null),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .eq("is_public", false)
      .not("content", "is", null),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    fetchAll<Vote>(supabase, "caption_votes", "caption_id, vote_value, profile_id"),
  ]);

  // Aggregate votes per caption
  const captionScore: Record<string, number> = {};
  const captionVoteCount: Record<string, number> = {};
  const voterTotals: Record<string, { count: number; net: number }> = {};
  let upvotes = 0;
  let downvotes = 0;

  for (const v of votes) {
    captionScore[v.caption_id] = (captionScore[v.caption_id] ?? 0) + v.vote_value;
    captionVoteCount[v.caption_id] = (captionVoteCount[v.caption_id] ?? 0) + 1;
    if (v.vote_value > 0) upvotes++;
    else if (v.vote_value < 0) downvotes++;
    const vt = voterTotals[v.profile_id] ?? { count: 0, net: 0 };
    vt.count++;
    vt.net += v.vote_value;
    voterTotals[v.profile_id] = vt;
  }

  const captionIdsWithVotes = Object.keys(captionScore);
  const ratedCaptionsCount = captionIdsWithVotes.length;
  const avgVotesPerRatedCaption =
    ratedCaptionsCount > 0 ? votes.length / ratedCaptionsCount : 0;
  const avgScorePerRatedCaption =
    ratedCaptionsCount > 0
      ? captionIdsWithVotes.reduce((s, id) => s + captionScore[id], 0) / ratedCaptionsCount
      : 0;

  // Top 10 by net score
  const topByScore = [...captionIdsWithVotes]
    .sort((a, b) => captionScore[b] - captionScore[a])
    .slice(0, 10);

  // Bottom 10 by net score
  const bottomByScore = [...captionIdsWithVotes]
    .filter((id) => captionScore[id] < 0)
    .sort((a, b) => captionScore[a] - captionScore[b])
    .slice(0, 10);

  // Top 10 by total vote volume
  const mostVoted = [...captionIdsWithVotes]
    .sort((a, b) => captionVoteCount[b] - captionVoteCount[a])
    .slice(0, 10);

  // Fetch caption + image details for the top sets
  const allTopCaptionIds = Array.from(
    new Set([...topByScore, ...bottomByScore, ...mostVoted]),
  );

  let captionRows: CaptionRow[] = [];
  let imageRows: ImageRow[] = [];

  if (allTopCaptionIds.length > 0) {
    const { data } = await supabase
      .from("captions")
      .select("id, content, image_id, is_public, profile_id, created_datetime_utc")
      .in("id", allTopCaptionIds);
    captionRows = (data as CaptionRow[]) ?? [];

    const imageIds = Array.from(
      new Set(
        captionRows
          .map((c) => c.image_id)
          .filter((id): id is string => !!id),
      ),
    );
    if (imageIds.length > 0) {
      const { data: imgData } = await supabase
        .from("images")
        .select("id, url, image_description")
        .in("id", imageIds);
      imageRows = (imgData as ImageRow[]) ?? [];
    }
  }

  const captionMap: Record<string, CaptionRow> = {};
  captionRows.forEach((c) => (captionMap[c.id] = c));
  const imageMap: Record<string, ImageRow> = {};
  imageRows.forEach((i) => (imageMap[i.id] = i));

  // Top voters
  const topVoterIds = Object.entries(voterTotals)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([id]) => id);

  let voterProfiles: ProfileRow[] = [];
  if (topVoterIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", topVoterIds);
    voterProfiles = (profiles as ProfileRow[]) ?? [];
  }
  const profileMap: Record<string, ProfileRow> = {};
  voterProfiles.forEach((p) => (profileMap[p.id] = p));

  const stats = [
    { label: "Total Captions", value: totalCaptions ?? 0 },
    { label: "Public Captions", value: publicCaptions ?? 0 },
    { label: "Private Captions", value: privateCaptions ?? 0 },
    { label: "Total Votes", value: totalVotes ?? 0 },
    { label: "Upvotes", value: upvotes },
    { label: "Downvotes", value: downvotes },
    { label: "Captions Rated", value: ratedCaptionsCount },
    {
      label: "Avg Score / Rated",
      value: avgScorePerRatedCaption.toFixed(2),
    },
    {
      label: "Avg Votes / Rated",
      value: avgVotesPerRatedCaption.toFixed(2),
    },
  ];

  function CaptionListItem({
    captionId,
    score,
    count,
  }: {
    captionId: string;
    score: number;
    count: number;
  }) {
    const c = captionMap[captionId];
    const img = c?.image_id ? imageMap[c.image_id] : null;
    return (
      <li className="flex items-start gap-3 rounded-md border border-zinc-800 p-3">
        {img ? (
          <img
            src={img.url}
            alt=""
            className="h-12 w-12 flex-shrink-0 rounded object-cover"
          />
        ) : (
          <div className="h-12 w-12 flex-shrink-0 rounded bg-zinc-800" />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm text-zinc-200">
            {c?.content ?? "(missing)"}
          </p>
          <div className="mt-1 flex gap-3 text-xs text-zinc-500">
            <span className={score > 0 ? "text-green-400" : score < 0 ? "text-red-400" : ""}>
              Score: {score > 0 ? "+" : ""}
              {score}
            </span>
            <span>{count} {count === 1 ? "vote" : "votes"}</span>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Caption Stats</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Aggregated statistics about captions and the votes users are casting on them.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
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
          <h2 className="text-lg font-semibold text-white">Top Rated Captions</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Highest net score (upvotes minus downvotes).
          </p>
          {topByScore.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {topByScore.map((id) => (
                <CaptionListItem
                  key={id}
                  captionId={id}
                  score={captionScore[id]}
                  count={captionVoteCount[id]}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No rated captions yet.</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold text-white">Most Voted Captions</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Most votes cast (regardless of direction).
          </p>
          {mostVoted.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {mostVoted.map((id) => (
                <CaptionListItem
                  key={id}
                  captionId={id}
                  score={captionScore[id]}
                  count={captionVoteCount[id]}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No votes yet.</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold text-white">Lowest Rated Captions</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Most negative net score.
          </p>
          {bottomByScore.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {bottomByScore.map((id) => (
                <CaptionListItem
                  key={id}
                  captionId={id}
                  score={captionScore[id]}
                  count={captionVoteCount[id]}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No negatively scored captions.</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold text-white">Most Active Raters</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Users who cast the most votes.
          </p>
          {topVoterIds.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {topVoterIds.map((id) => {
                const p = profileMap[id];
                const t = voterTotals[id];
                const name =
                  p?.first_name || p?.last_name
                    ? `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim()
                    : p?.email ?? id.slice(0, 8);
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-md border border-zinc-800 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-200">{name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {p?.email ?? "—"}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 gap-3 text-xs text-zinc-400">
                      <span>{t.count} votes</span>
                      <span
                        className={
                          t.net > 0
                            ? "text-green-400"
                            : t.net < 0
                              ? "text-red-400"
                              : ""
                        }
                      >
                        net {t.net > 0 ? "+" : ""}
                        {t.net}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No raters yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
