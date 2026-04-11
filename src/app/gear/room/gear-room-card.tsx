"use client";

import { Scale } from "lucide-react";
import { CONDITION_LABELS } from "../schema";
import type { GearItemRow } from "../gear-client";
import { useCardTilt } from "./use-card-tilt";

const CONDITION_DOTS: Record<string, string> = {
  new: "bg-emerald-400 shadow-emerald-400/50",
  like_new: "bg-teal-400 shadow-teal-400/50",
  good: "bg-sky-400 shadow-sky-400/50",
  fair: "bg-amber-400 shadow-amber-400/50",
  poor: "bg-red-400 shadow-red-400/50",
};

type GearRoomCardProps = {
  item: GearItemRow;
  onClick: () => void;
};

export function GearRoomCard({ item, onClick }: GearRoomCardProps) {
  const { ref, style, glowX, glowY, hovering, handlers } = useCardTilt();

  const conditionDot = item.condition
    ? CONDITION_DOTS[item.condition] ?? ""
    : "";
  const conditionLabel = item.condition
    ? CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS] ?? item.condition
    : null;

  return (
    <div
      ref={ref}
      style={style}
      {...handlers}
      onClick={onClick}
      className="group/card relative cursor-pointer rounded-xl border border-white/[0.08] bg-stone-900/60 backdrop-blur-md before:absolute before:top-[-4px] before:left-1/2 before:-translate-x-1/2 before:h-2 before:w-2 before:rounded-full before:bg-stone-500/80"
    >
      {/* Mouse-following glow */}
      {hovering ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.1) 0%, transparent 55%)`,
          }}
        />
      ) : null}

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2 p-4">
        {/* Name + brand */}
        <div className="min-w-0">
          <p className="truncate font-semibold leading-snug text-stone-100">
            {item.name}
          </p>
          {item.brand ? (
            <p className="mt-0.5 truncate text-xs text-stone-400">
              {item.brand}
              {item.model ? ` ${item.model}` : ""}
            </p>
          ) : null}
        </div>

        {/* Bottom row: condition + weight */}
        <div className="flex items-center gap-3 text-xs text-stone-400">
          {conditionLabel ? (
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full shadow-sm ${conditionDot}`}
              />
              {conditionLabel}
            </span>
          ) : null}
          {item.weight != null ? (
            <span className="flex items-center gap-1 rounded-full bg-stone-800/80 px-2 py-0.5">
              <Scale size={10} />
              {item.weight} kg
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
