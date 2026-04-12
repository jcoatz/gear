import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mountain, Compass, Backpack, Map } from "lucide-react";
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
    <div className="flex min-h-dvh flex-col bg-g-page">
      {/* Hero */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24">
        {/* Background effects */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--g-glow)] via-transparent to-g-page"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--g-dot) 1px, transparent 1px)",
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
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-g-accent-surface text-g-accent shadow-lg shadow-amber-500/10">
            <Backpack size={40} strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-g-text sm:text-5xl">
              Gear
            </h1>
            <p className="text-lg text-g-text-2">
              Track, organize, and manage your outdoor equipment.
              <br className="hidden sm:inline" />
              Plan trips. Pack smart. Know what you own.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/gear"
              className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl bg-g-accent-hover px-6 py-3 text-sm font-semibold text-g-accent shadow-md shadow-amber-500/10 transition-colors hover:bg-g-accent-hover"
            >
              <Backpack size={18} />
              Open gear list
            </Link>
            <Link
              href="/trips"
              className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-g-border bg-g-raised px-6 py-3 text-sm font-semibold text-g-text-2 transition-colors hover:bg-g-raised"
            >
              <Map size={18} />
              Plan a trip
            </Link>
          </div>

          <Link
            href="/login"
            className="text-sm text-g-text-3 underline underline-offset-4 hover:text-g-text-2"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-g-border py-6 text-center text-xs text-g-text-4">
        Built with Next.js &amp; Supabase
      </footer>
    </div>
  );
}
