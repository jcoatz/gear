"use client";

import {
  ArrowRight,
  Award,
  Backpack,
  Calendar,
  ChevronRight,
  Copy,
  DollarSign,
  Heart,
  Loader2,
  Map,
  Package,
  Scale,
  Shield,
  Sparkles,
  Star,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getRecommendations } from "./recommendations";
import { deleteTemplate, createTripFromTemplate } from "@/app/trips/template-actions";

type GearItem = {
  id: string;
  name: string;
  brand: string | null;
  weight: number | null;
  price: number | null;
  wishlist: boolean;
  createdAt: string;
  categoryName: string | null;
};

type Trip = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  targetWeight: number | null;
  itemCount: number;
  packedCount: number;
  totalWeight: number;
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
};

type DashboardClientProps = {
  gear: GearItem[];
  trips: Trip[];
  userActivities: Record<string, string>;
  templates: Template[];
  userEmail?: string;
};

export function DashboardClient({
  gear,
  trips,
  userActivities,
  templates,
  userEmail,
}: DashboardClientProps) {
  const router = useRouter();
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);

  // Stats
  const totalGear = gear.length;
  const totalWeight = gear.reduce((s, g) => s + (g.weight ?? 0), 0);
  const totalValue = gear.reduce((s, g) => s + (g.price ?? 0), 0);
  const activityCount = Object.keys(userActivities).length;

  // Recommendations
  const recommendations = useMemo(
    () =>
      getRecommendations(
        userActivities,
        gear.map((g) => ({ name: g.name, categoryName: g.categoryName })),
      ),
    [userActivities, gear],
  );

  // Upcoming trips (future start_date)
  const today = new Date().toISOString().slice(0, 10);
  const upcomingTrips = trips.filter(
    (t) => t.startDate && t.startDate >= today,
  );
  const recentGear = gear.slice(0, 6);

  async function handleDeleteTemplate(id: string) {
    setDeletingTemplate(id);
    await deleteTemplate(id);
    setDeletingTemplate(null);
    router.refresh();
  }

  async function handleUseTemplate(template: Template) {
    setCreatingFromTemplate(template.id);
    const result = await createTripFromTemplate(template.id, `${template.name} Trip`);
    setCreatingFromTemplate(null);
    if (result.ok) {
      router.push(`/trips/${result.tripId}`);
    }
  }

  const greeting = getGreeting();
  const handle = userEmail?.split("@")[0] ?? "explorer";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 pt-8 sm:p-6 sm:pt-10">
      {/* Hero band */}
      <section
        className="relative overflow-hidden rounded-3xl border border-g-border bg-g-card/60 p-6 backdrop-blur-xl sm:p-8"
        style={{ animation: "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--g-aurora-1), transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-fade opacity-60"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-g-text-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {greeting} · {formatToday()}
            </div>
            <h1 className="font-display text-4xl font-medium leading-tight tracking-tight text-g-text sm:text-5xl">
              Welcome back,{" "}
              <span className="text-gradient-accent italic">{handle}</span>.
            </h1>
            <p className="max-w-lg text-sm text-g-text-2 sm:text-base">
              {buildLedeSummary(totalGear, trips.length, activityCount)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/gear"
              className="inline-flex items-center gap-1.5 rounded-full border border-g-border bg-g-raised/70 px-3.5 py-1.5 text-xs font-medium text-g-text-2 transition-colors hover:border-g-border-active hover:text-g-text"
            >
              <Package size={12} /> Add gear
            </Link>
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 rounded-full border border-g-border-active bg-g-accent-surface px-3.5 py-1.5 text-xs font-semibold text-g-accent transition-colors hover:bg-g-accent-hover"
            >
              <Map size={12} /> Plan a trip
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard
          href="/gear"
          icon={<Package size={18} />}
          value={totalGear}
          label="Gear items"
          tone="amber"
        />
        <StatCard
          href="/gear"
          icon={<Scale size={18} />}
          value={`${totalWeight.toFixed(1)} kg`}
          label="Total weight"
          tone="sky"
        />
        <StatCard
          href="/gear"
          icon={<DollarSign size={18} />}
          value={totalValue > 0 ? `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "$0"}
          label="Investment"
          tone="emerald"
        />
        <StatCard
          href="/trips"
          icon={<Map size={18} />}
          value={trips.length}
          label="Trips"
          tone="violet"
        />
        <StatCard
          href="/activities"
          icon={<Zap size={18} />}
          value={activityCount}
          label="Activities"
          tone="orange"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Gear recommendations */}
          <section className="rounded-2xl border border-g-border bg-g-card/70 backdrop-blur-sm overflow-hidden transition-colors hover:border-g-border-active/60">
            <div className="flex items-center justify-between px-5 py-4 border-b border-g-border">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-g-accent" />
                <h2 className="font-semibold text-g-text">Gear Recommendations</h2>
              </div>
              <Link
                href="/activities"
                className="flex items-center gap-1 text-xs text-g-text-3 hover:text-g-text-2 transition-colors"
              >
                Activities <ChevronRight size={12} />
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="px-5 py-8 text-center">
                {activityCount === 0 ? (
                  <>
                    <Zap size={24} className="mx-auto mb-2 text-g-text-4" />
                    <p className="text-sm text-g-text-3">
                      Add activities to get personalized gear recommendations
                    </p>
                    <Link
                      href="/activities"
                      className="mt-3 inline-flex items-center gap-1 text-sm text-g-accent hover:underline"
                    >
                      Browse activities <ArrowRight size={12} />
                    </Link>
                  </>
                ) : (
                  <>
                    <Shield size={24} className="mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm text-g-text-3">
                      You have all the gear you need — nice!
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-g-border">
                {recommendations.slice(0, 8).map((rec) => (
                  <div
                    key={rec.keyword}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                      <Target size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-g-text capitalize">
                        {rec.keyword}
                      </p>
                      <p className="text-xs text-g-text-3 truncate">
                        Needed for{" "}
                        {rec.activities
                          .slice(0, 3)
                          .map((a) => a.name)
                          .join(", ")}
                        {rec.activities.length > 3
                          ? ` +${rec.activities.length - 3} more`
                          : ""}
                      </p>
                    </div>
                    <Link
                      href="/gear"
                      className="flex items-center gap-1 rounded-lg border border-g-border bg-g-raised px-2.5 py-1.5 text-xs text-g-text-3 hover:text-g-text-2 hover:border-g-border-active transition-colors"
                    >
                      <Heart size={10} />
                      Wishlist
                    </Link>
                  </div>
                ))}
                {recommendations.length > 8 ? (
                  <div className="px-5 py-3 text-center">
                    <p className="text-xs text-g-text-4">
                      +{recommendations.length - 8} more recommendations
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {/* Recent gear */}
          <section className="rounded-2xl border border-g-border bg-g-card/70 backdrop-blur-sm overflow-hidden transition-colors hover:border-g-border-active/60">
            <div className="flex items-center justify-between px-5 py-4 border-b border-g-border">
              <div className="flex items-center gap-2">
                <Backpack size={16} className="text-g-accent" />
                <h2 className="font-semibold text-g-text">Recent Gear</h2>
              </div>
              <Link
                href="/gear"
                className="flex items-center gap-1 text-xs text-g-text-3 hover:text-g-text-2 transition-colors"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {recentGear.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Package size={24} className="mx-auto mb-2 text-g-text-4" />
                <p className="text-sm text-g-text-3">No gear yet</p>
                <Link
                  href="/gear"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-g-accent hover:underline"
                >
                  Add gear <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-g-border">
                {recentGear.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 px-5 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-g-text truncate">
                        {g.name}
                      </p>
                      <p className="text-xs text-g-text-3">
                        {[g.brand, g.categoryName].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {g.price != null ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        ${g.price}
                      </span>
                    ) : null}
                    {g.weight != null ? (
                      <span className="text-xs text-g-text-3">
                        {g.weight} kg
                      </span>
                    ) : null}
                    {g.wishlist ? (
                      <Heart size={12} className="text-red-400" fill="currentColor" />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Upcoming trips */}
          <section className="rounded-2xl border border-g-border bg-g-card/70 backdrop-blur-sm overflow-hidden transition-colors hover:border-g-border-active/60">
            <div className="flex items-center justify-between px-5 py-4 border-b border-g-border">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-emerald-400" />
                <h2 className="font-semibold text-g-text">Upcoming Trips</h2>
              </div>
              <Link
                href="/trips"
                className="flex items-center gap-1 text-xs text-g-text-3 hover:text-g-text-2 transition-colors"
              >
                All trips <ChevronRight size={12} />
              </Link>
            </div>

            {upcomingTrips.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Map size={24} className="mx-auto mb-2 text-g-text-4" />
                <p className="text-sm text-g-text-3">No upcoming trips</p>
                <Link
                  href="/trips"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-g-accent hover:underline"
                >
                  Plan a trip <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-g-border">
                {upcomingTrips.slice(0, 5).map((trip) => {
                  const pctPacked =
                    trip.itemCount > 0
                      ? Math.round(
                          (trip.packedCount / trip.itemCount) * 100,
                        )
                      : 0;
                  return (
                    <Link
                      key={trip.id}
                      href={`/trips/${trip.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02] dark:hover:bg-white/[0.02]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-g-text">
                          {trip.name}
                        </p>
                        <p className="text-xs text-g-text-3">
                          {trip.startDate}
                          {trip.endDate ? ` → ${trip.endDate}` : ""}{" "}
                          · {trip.itemCount} items
                        </p>
                      </div>
                      {/* Packed progress */}
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-g-raised overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pctPacked === 100
                                ? "bg-emerald-500"
                                : "bg-g-accent"
                            }`}
                            style={{ width: `${pctPacked}%` }}
                          />
                        </div>
                        <span className="text-xs text-g-text-3 w-8 text-right">
                          {pctPacked}%
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pack templates */}
          <section className="rounded-2xl border border-g-border bg-g-card/70 backdrop-blur-sm overflow-hidden transition-colors hover:border-g-border-active/60">
            <div className="flex items-center justify-between px-5 py-4 border-b border-g-border">
              <div className="flex items-center gap-2">
                <Copy size={16} className="text-violet-400" />
                <h2 className="font-semibold text-g-text">Pack Templates</h2>
              </div>
              <Link
                href="/trips"
                className="flex items-center gap-1 text-xs text-g-text-3 hover:text-g-text-2 transition-colors"
              >
                Trips <ChevronRight size={12} />
              </Link>
            </div>

            {templates.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Copy size={24} className="mx-auto mb-2 text-g-text-4" />
                <p className="text-sm text-g-text-3">No templates yet</p>
                <p className="mt-1 text-xs text-g-text-4">
                  Save a trip&apos;s gear list as a reusable template
                </p>
              </div>
            ) : (
              <div className="divide-y divide-g-border">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-g-text">
                        {tpl.name}
                      </p>
                      <p className="text-xs text-g-text-3">
                        {tpl.itemCount} item{tpl.itemCount !== 1 ? "s" : ""}
                        {tpl.description ? ` · ${tpl.description}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUseTemplate(tpl)}
                      disabled={creatingFromTemplate === tpl.id}
                      className="flex items-center gap-1 rounded-lg border border-g-border-active bg-g-accent-surface px-2.5 py-1.5 text-xs font-medium text-g-accent hover:bg-g-accent-hover transition-colors disabled:opacity-50"
                    >
                      {creatingFromTemplate === tpl.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <ArrowRight size={10} />
                      )}
                      Use
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      disabled={deletingTemplate === tpl.id}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-g-text-4 hover:bg-g-error-bg hover:text-g-error-text transition-colors"
                    >
                      {deletingTemplate === tpl.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Trash2 size={10} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Activity highlights */}
          <section className="rounded-2xl border border-g-border bg-g-card/70 backdrop-blur-sm overflow-hidden transition-colors hover:border-g-border-active/60">
            <div className="flex items-center justify-between px-5 py-4 border-b border-g-border">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-orange-400" />
                <h2 className="font-semibold text-g-text">Activity Highlights</h2>
              </div>
              <Link
                href="/activities"
                className="flex items-center gap-1 text-xs text-g-text-3 hover:text-g-text-2 transition-colors"
              >
                All activities <ChevronRight size={12} />
              </Link>
            </div>

            {activityCount === 0 ? (
              <div className="px-5 py-8 text-center">
                <Zap size={24} className="mx-auto mb-2 text-g-text-4" />
                <p className="text-sm text-g-text-3">
                  Track your outdoor activities
                </p>
                <Link
                  href="/activities"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-g-accent hover:underline"
                >
                  Get started <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userActivities).map(([slug, level]) => {
                    const isPro = level === "pro";
                    const isOften = level === "often";
                    return (
                      <span
                        key={slug}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                          isPro
                            ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                            : isOften
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-g-border bg-g-raised text-g-text-3"
                        }`}
                      >
                        {isPro ? <Star size={10} /> : null}
                        {slug
                          .split("-")
                          .map(
                            (w) =>
                              w.charAt(0).toUpperCase() + w.slice(1),
                          )
                          .join(" ")}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

type StatTone = "amber" | "sky" | "emerald" | "violet" | "orange";

const TONE_STYLES: Record<
  StatTone,
  { icon: string; glow: string; bar: string }
> = {
  amber: {
    icon: "bg-amber-500/10 text-amber-500 ring-amber-500/20 dark:text-amber-300",
    glow: "from-amber-500/25",
    bar: "from-amber-500/60 to-amber-500/0",
  },
  sky: {
    icon: "bg-sky-500/10 text-sky-500 ring-sky-500/20 dark:text-sky-300",
    glow: "from-sky-500/25",
    bar: "from-sky-500/60 to-sky-500/0",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20 dark:text-emerald-300",
    glow: "from-emerald-500/25",
    bar: "from-emerald-500/60 to-emerald-500/0",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-500 ring-violet-500/20 dark:text-violet-300",
    glow: "from-violet-500/25",
    bar: "from-violet-500/60 to-violet-500/0",
  },
  orange: {
    icon: "bg-orange-500/10 text-orange-500 ring-orange-500/20 dark:text-orange-300",
    glow: "from-orange-500/25",
    bar: "from-orange-500/60 to-orange-500/0",
  },
};

function StatCard({
  href,
  icon,
  value,
  label,
  tone = "amber",
}: {
  href: string;
  icon: React.ReactNode;
  value: number | string;
  label: string;
  tone?: StatTone;
}) {
  const t = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-g-border bg-g-card/70 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-g-border-active"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-radial ${t.glow} via-transparent to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
        style={{
          background: `radial-gradient(circle, currentColor, transparent 60%)`,
        }}
      />
      <div className="relative flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset ${t.icon}`}
        >
          {icon}
        </div>
        <ChevronRight
          size={14}
          className="text-g-text-4 transition-transform group-hover:translate-x-0.5 group-hover:text-g-text-2"
        />
      </div>
      <div className="relative">
        <p className="font-display text-2xl font-medium tracking-tight text-g-text">
          {value}
        </p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-g-text-3">
          {label}
        </p>
      </div>
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r ${t.bar}`}
      />
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Night watch";
  if (h < 12) return "Morning ascent";
  if (h < 17) return "Afternoon trail";
  if (h < 21) return "Evening camp";
  return "Night watch";
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function buildLedeSummary(
  gearCount: number,
  tripCount: number,
  activityCount: number,
) {
  if (gearCount === 0 && tripCount === 0 && activityCount === 0) {
    return "Start by cataloguing your first piece of gear, or plan the trip that\u2019s been on your mind.";
  }
  const parts: string[] = [];
  if (gearCount > 0) parts.push(`${gearCount} item${gearCount === 1 ? "" : "s"} catalogued`);
  if (tripCount > 0) parts.push(`${tripCount} trip${tripCount === 1 ? "" : "s"} on the books`);
  if (activityCount > 0) parts.push(`${activityCount} activit${activityCount === 1 ? "y" : "ies"} tracked`);
  return `${parts.join(" \u00b7 ")}. Everything in its place.`;
}
