import Link from "next/link";
import { Mountain, Compass, Backpack } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Hero */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24">
        {/* Background gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-amber-500/5"
        />

        {/* Decorative icons */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <Compass
            className="absolute top-[12%] left-[8%] text-primary/[0.06] sm:text-primary/[0.04]"
            size={120}
            strokeWidth={1}
          />
          <Mountain
            className="absolute right-[10%] bottom-[15%] text-primary/[0.06] sm:text-primary/[0.04]"
            size={140}
            strokeWidth={1}
          />
        </div>

        <div className="relative z-10 flex max-w-lg flex-col items-center gap-8 text-center">
          {/* Logo mark */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Backpack size={40} strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Gear
            </h1>
            <p className="text-lg text-muted-foreground">
              Track, organize, and manage your outdoor equipment.
              <br className="hidden sm:inline" />
              Know what you own and what you need.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/gear"
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-w-[10rem] justify-center shadow-md shadow-primary/20",
              )}
            >
              Open gear list
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-w-[10rem] justify-center",
              )}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Built with Next.js &amp; Supabase
      </footer>
    </div>
  );
}
