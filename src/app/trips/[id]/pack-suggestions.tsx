"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getGearIcon } from "@/app/gear/gear-icons";
import type { GearPoolItem } from "./trip-detail";
import { getSuggestions, type GearSuggestion, type SuggestionReason } from "./smart-suggestions";

type PackSuggestionsProps = {
  availableGear: GearPoolItem[];
  userActivities: Record<string, string>;
  pastFrequency: Record<string, number>;
  adding: string | null;
  onAdd: (id: string) => void;
};

export function PackSuggestions({
  availableGear,
  userActivities,
  pastFrequency,
  adding,
  onAdd,
}: PackSuggestionsProps) {
  const [expanded, setExpanded] = useState(true);
  const [addingAll, setAddingAll] = useState(false);

  const suggestions = useMemo(
    () => getSuggestions(availableGear, userActivities, pastFrequency),
    [availableGear, userActivities, pastFrequency],
  );

  if (suggestions.length === 0) return null;

  async function handleAddAll() {
    setAddingAll(true);
    for (const s of suggestions) {
      onAdd(s.item.id);
      // Small delay to stagger the optimistic updates
      await new Promise((r) => setTimeout(r, 80));
    }
    setAddingAll(false);
  }

  return (
    <div className="rounded-xl border border-g-accent/20 bg-gradient-to-r from-g-accent-surface/40 to-g-card backdrop-blur-md overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-g-accent-surface/20"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
          <Sparkles size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-g-text">
            Smart Suggestions
            <span className="ml-2 rounded-full bg-g-accent-surface px-2 py-0.5 text-[11px] font-medium text-g-accent">
              {suggestions.length}
            </span>
          </p>
          <p className="text-[11px] text-g-text-3">
            Based on your activities, past trips & gear categories
          </p>
        </div>
        {expanded ? (
          <ChevronDown size={16} className="text-g-text-3" />
        ) : (
          <ChevronRight size={16} className="text-g-text-3" />
        )}
      </button>

      {/* Suggestions list */}
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="suggestions"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-g-border/50">
              {/* Add all button */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-g-border/30">
                <span className="text-[11px] text-g-text-4">
                  Recommended for this trip
                </span>
                <button
                  type="button"
                  onClick={handleAddAll}
                  disabled={addingAll}
                  className="flex items-center gap-1 rounded-lg bg-g-accent-hover px-2.5 py-1 text-[11px] font-medium text-g-accent transition-colors hover:bg-g-accent-hover disabled:opacity-50"
                >
                  {addingAll ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Plus size={10} />
                  )}
                  Add all {suggestions.length}
                </button>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-1 p-2 max-h-[320px] overflow-y-auto">
                {suggestions.map((suggestion, i) => (
                  <SuggestionCard
                    key={suggestion.item.id}
                    suggestion={suggestion}
                    index={i}
                    adding={adding}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Suggestion Card
   ═══════════════════════════════════════════════ */

function SuggestionCard({
  suggestion,
  index,
  adding,
  onAdd,
}: {
  suggestion: GearSuggestion;
  index: number;
  adding: string | null;
  onAdd: (id: string) => void;
}) {
  const { item, reasons } = suggestion;
  const Icon = getGearIcon(item.name, item.brand, item.categoryName);
  const isAdding = adding === item.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="flex items-center gap-3 rounded-lg border border-g-border/40 bg-g-card/60 px-3 py-2 transition-all hover:border-g-border-active hover:bg-g-card"
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
        <Icon size={16} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-g-text">{item.name}</p>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {reasons.slice(0, 2).map((reason, ri) => (
            <ReasonBadge key={ri} reason={reason} />
          ))}
        </div>
      </div>

      {/* Weight */}
      {item.weight != null ? (
        <span className="shrink-0 text-[11px] text-g-text-4">
          {item.weight} kg
        </span>
      ) : null}

      {/* Add button */}
      <button
        type="button"
        onClick={() => onAdd(item.id)}
        disabled={isAdding}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-g-accent-surface text-g-accent transition-colors hover:bg-g-accent-hover disabled:opacity-50"
      >
        {isAdding ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Plus size={14} />
        )}
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Reason Badge
   ═══════════════════════════════════════════════ */

const REASON_STYLES: Record<
  SuggestionReason["type"],
  { bg: string; text: string; border: string }
> = {
  activity: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  frequency: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
  },
  essential: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  tag_match: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
  },
};

function ReasonBadge({ reason }: { reason: SuggestionReason }) {
  const style = REASON_STYLES[reason.type];
  let label: string;

  switch (reason.type) {
    case "activity":
      label = reason.activityName;
      break;
    case "frequency":
      label = `Packed ${reason.tripCount} trip${reason.tripCount === 1 ? "" : "s"}`;
      break;
    case "essential":
      label = reason.category;
      break;
    case "tag_match":
      label = reason.tag;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0 text-[9px] font-medium ${style.bg} ${style.text} ${style.border}`}
    >
      {reason.type === "activity" ? <Zap size={7} /> : null}
      {label}
    </span>
  );
}
