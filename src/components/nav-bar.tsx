"use client";

import {
  Backpack,
  Briefcase,
  LayoutDashboard,
  Map,
  LogOut,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "./theme-toggle";

type NavBarProps = {
  userEmail: string;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/gear", label: "Gear", icon: Backpack },
  { href: "/bags", label: "Bags", icon: Briefcase },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/activities", label: "Activities", icon: Zap },
];

export function NavBar({ userEmail }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-40 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4">
      {/* Page-top fade so content slips under the floating bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-g-page via-g-page/80 to-transparent"
      />

      <nav className="surface-glass relative flex h-14 w-full max-w-6xl items-center gap-2 rounded-2xl px-3 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.25)]">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-1.5"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent ring-1 ring-inset ring-g-border-active transition-transform group-hover:scale-105">
            <Backpack size={15} strokeWidth={1.75} />
            <span
              aria-hidden
              className="absolute inset-0 rounded-lg bg-g-accent/30 blur-lg opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
          <span className="font-display text-base font-medium tracking-tight text-g-text">
            Gear
          </span>
        </Link>

        <div className="mx-1 hidden h-6 w-px bg-g-border sm:block" />

        {/* Nav links */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-g-text"
                    : "text-g-text-3 hover:text-g-text"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-lg bg-g-accent-surface ring-1 ring-inset ring-g-border-active"
                  />
                ) : null}
                <Icon size={14} className="relative" />
                <span className="relative">{label}</span>
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-1 h-px bg-gradient-to-r from-transparent via-g-accent to-transparent"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Email + controls */}
        <span className="hidden max-w-[180px] truncate text-xs text-g-text-3 md:block">
          {userEmail}
        </span>
        <ThemeToggle />
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text-2"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </nav>
    </div>
  );
}
