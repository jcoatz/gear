"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { TAG_GROUPS, TAG_GROUP_COLORS_DARK } from "../tags";
import { updateGearItemTags } from "../actions";
import type { GearItemRow } from "../gear-client";

type TagEditorProps = {
  item: GearItemRow;
  onBack: () => void;
  onSaved: () => void;
};

export function TagEditor({ item, onBack, onSaved }: TagEditorProps) {
  const [selected, setSelected] = useState<string[]>([...item.tags]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateGearItemTags(item.id, selected);
    setSaving(false);
    if (result.ok) {
      onSaved();
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
        <h2 className="text-lg font-bold text-g-text">
          Edit tags — {item.name}
        </h2>
      </div>

      <div className="space-y-4">
        {TAG_GROUPS.map((group) => {
          const colors = TAG_GROUP_COLORS_DARK[group.group];
          return (
            <div key={group.group}>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-g-text-3">
                {group.group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.tags.map((tag) => {
                  const active = selected.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggle(tag)}
                      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                        active
                          ? `${colors.border} ${colors.bg} ${colors.text}`
                          : "border-g-border bg-g-raised text-g-text-3 hover:bg-g-raised hover:text-g-text-2"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
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
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-g-accent-hover px-4 py-2 text-sm font-medium text-g-accent transition-colors hover:bg-g-accent-hover disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save tags
        </button>
      </div>
    </div>
  );
}
