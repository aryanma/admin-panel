"use client";

import { useState, useTransition } from "react";
import { createImage, updateImage, deleteImage } from "@/app/actions";

type Image = {
  id: string;
  url: string;
  alt_text: string | null;
  created_datetime_utc: string | null;
};

export function ImageTable({ images }: { images: Image[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createImage(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setShowForm(false);
      }
    });
  }

  function handleUpdate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateImage(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setEditingId(null);
      }
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
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
        }}
        className="mb-4 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        {showForm ? "Cancel" : "Add Image"}
      </button>

      {showForm && (
        <form
          action={handleCreate}
          className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-zinc-400">Image URL</label>
              <input
                name="url"
                required
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">
                Alt Text (optional)
              </label>
              <input
                name="alt_text"
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                placeholder="Description..."
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Image"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium">Alt Text</th>
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
                        <label className="block text-xs text-zinc-400">
                          Alt Text
                        </label>
                        <input
                          name="alt_text"
                          defaultValue={img.alt_text ?? ""}
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
                      <img
                        src={img.url}
                        alt={img.alt_text || ""}
                        className="h-10 w-10 rounded object-cover"
                      />
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-zinc-300">
                      {img.url}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {img.alt_text || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {img.created_datetime_utc
                        ? new Date(
                            img.created_datetime_utc
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(img.id);
                            setShowForm(false);
                          }}
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
