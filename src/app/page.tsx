import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Backpack,
  Compass,
  Map,
  Mountain,
  Scale,
  Sparkles,
  Tent,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-g-page">
      {/* ── Ambient layers ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-topo opacity-70" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-fade" />

      {/* Aurora blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, var(--g-aurora-1), transparent 60%)",
            animation: "aurora 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/4 -right-40 h-[620px] w-[620px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, var(--g-aurora-2), transparent 60%)",
            animation: "aurora 28s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[480px] w-[480px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--g-aurora-3), transparent 65%)",
            animation: "aurora 32s ease-in-out infinite",
          }}
        />
      </div>

      {/* Top corner mark */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-g-accent-surface text-g-accent ring-1 ring-inset ring-g-border-active">
            <Backpack size={18} strokeWidth={1.75} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-medium tracking-tight text-g-text">
              Gear
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-g-text-4">
              Alpine Dossier
            </span>
          </div>
        </div>
        <Link
          href="/login"
          className="group flex items-center gap-1.5 rounded-full border border-g-border bg-g-card/60 px-4 py-1.5 text-xs font-medium text-g-text-2 backdrop-blur transition hover:border-g-border-active hover:text-g-text"
        >
          Sign in
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-8 text-center sm:px-10">
        {/* Decorative ornaments */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <Compass
            size={220}
            strokeWidth={0.6}
            className="absolute top-[6%] left-[4%] text-g-text/[0.05]"
            style={{ animation: "drift 18s ease-in-out infinite" }}
          />
          <Mountain
            size={260}
            strokeWidth={0.6}
            className="absolute bottom-[8%] right-[3%] text-g-text/[0.05]"
            style={{ animation: "float 14s ease-in-out infinite" }}
          />
        </div>

        <div
          className="relative flex max-w-4xl flex-col items-center gap-8"
          style={{ animation: "reveal 1s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 rounded-full border border-g-border bg-g-card/60 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-g-text-3 backdrop-blur">
            <Sparkles size={11} className="text-g-accent" />
            <span>Field-tested · v1</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-tight text-g-text sm:text-7xl md:text-[5.5rem]">
            <span className="block">The home for</span>
            <span className="text-gradient-accent block italic">every ounce</span>
            <span className="block">you carry.</span>
          </h1>

          <p className="max-w-xl text-balance text-base text-g-text-2 sm:text-lg">
            A quiet command center for your outdoor kit. Catalogue every piece,
            weigh every bag, and plan trips with the certainty that nothing&apos;s
            left at home.
          </p>

          {/* CTAs */}
          <div className="mt-2 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/gear"
              className="group relative inline-flex min-w-[12rem] items-center justify-center gap-2 overflow-hidden rounded-xl bg-g-text px-6 py-3.5 text-sm font-semibold text-g-page shadow-[0_20px_40px_-16px_var(--g-text)] transition-transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Backpack size={16} />
                Open gear list
              </span>
              <span
                aria-hidden
                className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
              />
            </Link>
            <Link
              href="/trips"
              className="group inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-xl border border-g-border bg-g-card/60 px-6 py-3.5 text-sm font-semibold text-g-text-2 backdrop-blur transition-all hover:border-g-border-active hover:bg-g-card hover:text-g-text"
            >
              <Map size={16} className="text-g-accent" />
              Plan a trip
              <ArrowRight
                size={14}
                className="translate-x-0 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Feature trio */}
          <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <FeaturePill
              icon={<Backpack size={14} />}
              title="Inventory"
              body="Every item, condition, and weight"
            />
            <FeaturePill
              icon={<Scale size={14} />}
              title="Packing math"
              body="Target weights, never overloaded"
            />
            <FeaturePill
              icon={<Tent size={14} />}
              title="Trip templates"
              body="Reusable lists for every adventure"
            />
          </div>
        </div>
      </main>

      {/* Mountain silhouette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-56 opacity-[0.55]"
      >
        <svg
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="peakBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--g-text)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--g-text)" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="peakFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--g-text)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--g-text)" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path
            d="M0,240 L0,160 L120,90 L220,150 L340,60 L470,140 L580,100 L700,170 L820,80 L940,150 L1060,110 L1200,180 L1320,120 L1440,170 L1440,240 Z"
            fill="url(#peakBack)"
          />
          <path
            d="M0,240 L0,200 L100,160 L210,190 L330,140 L460,185 L580,155 L720,205 L860,160 L980,195 L1120,170 L1260,210 L1440,180 L1440,240 Z"
            fill="url(#peakFront)"
          />
        </svg>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-g-border/60 bg-g-page/40 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-[11px] uppercase tracking-[0.18em] text-g-text-4 sm:flex-row">
          <span>Built with Next.js &amp; Supabase</span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-g-accent" />
            Elevation 1,847m · Bearing 342°
          </span>
        </div>
      </footer>
    </div>
  );
}

function FeaturePill({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-g-border bg-g-card/60 p-4 text-left backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-g-border-active">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent ring-1 ring-inset ring-g-border-active">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-g-text">{title}</p>
        <p className="mt-0.5 text-xs text-g-text-3">{body}</p>
      </div>
    </div>
  );
}
