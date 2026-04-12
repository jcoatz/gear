"use client";

import { AlertTriangle, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteGearItem } from "../actions";
import type { GearItemRow } from "../gear-client";

type DeleteConfirmProps = {
  item: GearItemRow;
  onBack: () => void;
  onDeleted: () => void;
};

export function DeleteConfirm({ item, onBack, onDeleted }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteGearItem(item.id);
    setDeleting(false);
    if (result.ok) {
      onDeleted();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-stone-100">Delete item</h2>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
        <div>
          <p className="font-medium text-stone-200">
            Delete &ldquo;{item.name}&rdquo;?
          </p>
          <p className="mt-1 text-sm text-stone-400">
            This action cannot be undone. The item will be permanently removed
            from your gear inventory.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-white/[0.08] bg-stone-800/60 px-4 py-2 text-sm text-stone-300 transition-colors hover:bg-stone-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}
