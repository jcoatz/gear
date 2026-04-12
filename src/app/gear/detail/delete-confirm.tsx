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
          className="flex h-8 w-8 items-center justify-center rounded-lg text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-g-text">Delete item</h2>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-g-error-border bg-g-error-bg p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-g-error-text" />
        <div>
          <p className="font-medium text-g-text">
            Delete &ldquo;{item.name}&rdquo;?
          </p>
          <p className="mt-1 text-sm text-g-text-2">
            This action cannot be undone. The item will be permanently removed
            from your gear inventory.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-g-error-border bg-g-error-bg px-3 py-2 text-sm text-g-error-text">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-g-border bg-g-raised px-4 py-2 text-sm text-g-text-2 transition-colors hover:bg-g-raised"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 rounded-lg bg-g-error-bg px-4 py-2 text-sm font-medium text-g-error-text transition-colors hover:bg-red-500/30 disabled:opacity-50"
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
