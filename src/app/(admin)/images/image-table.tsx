"use client";

import { useState, useTransition, useRef } from "react";
import { updateImage, deleteImage, getPresignedUrl, registerImage } from "@/app/actions";

type Image = {
  id: string;
  url: string;
  image_description: string | null;
  is_public: boolean;
  profile_id: string | null;
  created_datetime_utc: string | null;
};

export function ImageTable({ images }: { images: Image[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setError(null);
    setUploadStatus("Getting presigned URL...");

    try {
      const presigned = await getPresignedUrl(file.type);
      if (presigned.error) throw new Error(presigned.error);

      setUploadStatus("Uploading to storage...");
      const uploadRes = await fetch(presigned.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload to storage");

      setUploadStatus("Registering image...");
      const result = await registerImage(presigned.cdnUrl);
      if (result.error) throw new Error(result.error);

      setUploadStatus("Done!");
      setShowForm(false);
      setUploadStatus(null);
      // Force page refresh to show new image
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadStatus(null);
    }
  }

  function handleUpdate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateImage(formData);
      if (result.error) setError(result.error);
      else setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteImage(id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-900/30 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={() => { setShowForm(!showForm); setEditingId(null); setUploadStatus(null); }}
        className="mb-4 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        {showForm ? "Cancel" : "Upload Image"}
      </button>

      {showForm && (
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div>
            <label className="block text-sm text-zinc-400">Choose an image file</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-600"
            />
          </div>
          {uploadStatus && (
            <p className="mt-2 text-sm text-blue-400">{uploadStatus}</p>
          )}
          <button
            onClick={handleUpload}
            disabled={!!uploadStatus}
            className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
          >
            {uploadStatus ? uploadStatus : "Upload & Register"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Public</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {images.map((img) => (
              <tr key={img.id} className="hover:bg-zinc-900/50">
                {editingId === img.id ? (
                  <td colSpan={5} className="px-4 py-3">
                    <form action={handleUpdate} className="flex gap-3 items-end">
                      <input type="hidden" name="id" value={img.id} />
                      <div className="flex-1">
                        <label className="block text-xs text-zinc-400">URL</label>
                        <input
                          name="url"
                          defaultValue={img.url}
                          required
                          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-zinc-400">Context</label>
                        <input
                          name="additional_context"
                          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-zinc-300">
                      {img.image_description ? img.image_description.slice(0, 80) + "..." : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {img.is_public ? (
                        <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs text-green-400">Yes</span>
                      ) : (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {img.created_datetime_utc ? new Date(img.created_datetime_utc).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingId(img.id); setShowForm(false); }}
                          className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          disabled={isPending}
                          className="rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
