import Link from "next/link";
import { Mountain, Compass, Backpack, Map } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-950">
      {/* Hero */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24">
        {/* Background effects */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/[0.06] via-transparent to-stone-950"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Decorative icons */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <Compass
            className="absolute top-[12%] left-[8%] text-amber-500/[0.06]"
            size={120}
            strokeWidth={1}
          />
          <Mountain
            className="absolute right-[10%] bottom-[15%] text-amber-500/[0.06]"
            size={140}
            strokeWidth={1}
          />
        </div>

        <div className="relative z-10 flex max-w-lg flex-col items-center gap-8 text-center">
          {/* Logo mark */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 shadow-lg shadow-amber-500/10">
            <Backpack size={40} strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-stone-100 sm:text-5xl">
              Gear
            </h1>
            <p className="text-lg text-stone-400">
              Track, organize, and manage your outdoor equipment.
              <br className="hidden sm:inline" />
              Plan trips. Pack smart. Know what you own.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/gear"
              className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl bg-amber-500/20 px-6 py-3 text-sm font-semibold text-amber-300 shadow-md shadow-amber-500/10 transition-colors hover:bg-amber-500/30"
            >
              <Backpack size={18} />
              Open gear list
            </Link>
            <Link
              href="/trips"
              className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-stone-800/60 px-6 py-3 text-sm font-semibold text-stone-300 transition-colors hover:bg-stone-800"
            >
              <Map size={18} />
              Plan a trip
            </Link>
          </div>

          <Link
            href="/login"
            className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-300"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-stone-600">
        Built with Next.js &amp; Supabase
      </footer>
    </div>
  );
}
