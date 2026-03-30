import { requireAdmin } from "@/lib/require-admin";
import { ImageTable } from "./image-table";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { supabase } = await requireAdmin();

  const [{ data: images }, { count }] = await Promise.all([
    supabase
      .from("images")
      .select("id, url, image_description, is_public, profile_id, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .range(from, to),
    supabase.from("images").select("*", { count: "exact", head: true }),
  ]);

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Images</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Manage images ({totalCount})
      </p>
      <ImageTable images={images ?? []} />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/images?page=${page - 1}`}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/images?page=${page + 1}`}
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
