"use client";

import { useState, useTransition } from "react";

type Column = {
  key: string;
  label: string;
  editable?: boolean;
  type?: "text" | "number" | "select" | "boolean";
  options?: { value: string; label: string }[];
};

type CrudTableProps = {
  rows: Record<string, unknown>[];
  columns: Column[];
  createAction?: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  updateAction?: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  deleteAction?: (id: string) => Promise<{ error?: string; success?: boolean }>;
  entityName: string;
};

export function CrudTable({
  rows,
  columns,
  createAction,
  updateAction,
  deleteAction,
  entityName,
}: CrudTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const editableColumns = columns.filter((c) => c.editable);

  function handleCreate(formData: FormData) {
    if (!createAction) return;
    setError(null);
    startTransition(async () => {
      const result = await createAction(formData);
      if (result.error) setError(result.error);
      else setShowForm(false);
    });
  }

  function handleUpdate(formData: FormData) {
    if (!updateAction) return;
    setError(null);
    startTransition(async () => {
      const result = await updateAction(formData);
      if (result.error) setError(result.error);
      else setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!deleteAction || !confirm(`Delete this ${entityName}?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAction(id);
      if (result.error) setError(result.error);
    });
  }

  function renderInput(col: Column, defaultValue?: unknown) {
    const val = defaultValue != null ? String(defaultValue) : "";
    if (col.type === "select" && col.options) {
      return (
        <select
          name={col.key}
          defaultValue={val}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
        >
          {col.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    if (col.type === "boolean") {
      return (
        <select
          name={col.key}
          defaultValue={val}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }
    return (
      <input
        name={col.key}
        type={col.type === "number" ? "number" : "text"}
        defaultValue={val}
        className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
    );
  }

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-900/30 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {createAction && (
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="mb-4 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
        >
          {showForm ? "Cancel" : `Add ${entityName}`}
        </button>
      )}

      {showForm && createAction && (
        <form action={handleCreate} className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {editableColumns.map((col) => (
              <div key={col.key}>
                <label className="block text-sm text-zinc-400">{col.label}</label>
                {renderInput(col)}
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              {(updateAction || deleteAction) && (
                <th className="px-4 py-3 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row) => {
              const id = String(row.id);
              if (editingId === id && updateAction) {
                return (
                  <tr key={id}>
                    <td colSpan={columns.length + 1} className="px-4 py-3">
                      <form action={handleUpdate} className="flex flex-wrap gap-3 items-end">
                        <input type="hidden" name="id" value={id} />
                        {editableColumns.map((col) => (
                          <div key={col.key} className="min-w-[150px] flex-1">
                            <label className="block text-xs text-zinc-400">{col.label}</label>
                            {renderInput(col, row[col.key])}
                          </div>
                        ))}
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
                  </tr>
                );
              }
              return (
                <tr key={id} className="hover:bg-zinc-900/50">
                  {columns.map((col) => (
                    <td key={col.key} className="max-w-xs truncate px-4 py-3 text-zinc-300">
                      {row[col.key] === true
                        ? "Yes"
                        : row[col.key] === false
                        ? "No"
                        : row[col.key] != null
                        ? String(row[col.key])
                        : "—"}
                    </td>
                  ))}
                  {(updateAction || deleteAction) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {updateAction && (
                          <button
                            onClick={() => { setEditingId(id); setShowForm(false); }}
                            className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          >
                            Edit
                          </button>
                        )}
                        {deleteAction && (
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={isPending}
                            className="rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
